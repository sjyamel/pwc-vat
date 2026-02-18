
import { Injectable, BadRequestException } from '@nestjs/common';
import { Invoice, InvoiceItem, InvoiceStatus, ClaimableStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AIResponse } from '../utils/magicAI';

import { VatCategory, vatRate } from "../@nest/usual";



@Injectable()
export class GeminiService {
    async fiscalize(invoice: Invoice & { items: InvoiceItem[] }) {
        // 1. Math Check
        // Handle floating point precision issues properly
        // Using a tolerance is good, but ensuring we sum correctly first
        const calculatedTotal = invoice.netAmount + invoice.vatAmount;

        // Check tolerance
        if (Math.abs(calculatedTotal - invoice.totalPayable) > 0.05) {
            throw new BadRequestException(`Invoice math does not match (Net + VAT != Total). Calculated: ${calculatedTotal}, Provided: ${invoice.totalPayable}`);
        }

        // 2. Categorize Items using AI
        const itemDescriptions = invoice.items.map(i => i.description).join(', ');
        const prompt = `
            You are a VAT expert. Categorize the following invoice items into one of these VAT categories: 'STANDARD', 'ZERO_RATED', 'EXEMPT'.
            
            Items: ${itemDescriptions}

            Respond strictly with a JSON array of strings representing the category for each item in the same order. 
            Example: ["STANDARD", "ZERO_RATED", "STANDARD"]
            Do not include any markdown formatting or explanation.
        `;

        let categories: string[] = [];
        try {
            const aiResponse = await AIResponse(prompt);
            // Clean response if it contains markdown code blocks
            const cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            categories = JSON.parse(cleanResponse);
        } catch (error) {
            console.error("AI Categorization failed, defaulting to STANDARD", error);
            // Fallback to STANDARD for all if AI fails
            categories = invoice.items.map(() => 'STANDARD');
        }

        const fiscalizedItems = invoice.items.map((item, index) => {
            let category = VatCategory[categories[index]] || VatCategory.STANDARD;
            let rate = vatRate[category] || vatRate.STANDARD;

            return {
                ...item,
                vatCategory: category,
                vatRate: rate
            };
        });

        const mainCategory = fiscalizedItems.some(i => i.vatCategory === VatCategory.STANDARD)
            ? VatCategory.STANDARD
            : (fiscalizedItems[0]?.vatCategory || VatCategory.STANDARD);

        const irn = randomUUID();
        const fiscalizedAt = new Date();

        // 3. Generate QR Code
        const qrData = JSON.stringify({
            irn,
            total: invoice.totalPayable,
            date: fiscalizedAt.toISOString(),
            vat: invoice.vatAmount,
            orgId: invoice.organizationId
        });

        let qrCodeUrl = '';
        try {
            const QRCode = require('qrcode');
            qrCodeUrl = await QRCode.toDataURL(qrData);
        } catch (err) {
            console.error("QR Code generation failed", err);
        }

        return {
            status: InvoiceStatus.FISCALIZED,
            irn,
            fiscalizedAt,
            vatCategory: mainCategory,
            claimableStatus: ClaimableStatus.CLAIMABLE,
            items: fiscalizedItems,
            rejectionReason: null,
            qrCodeUrl
        };
    }
}
