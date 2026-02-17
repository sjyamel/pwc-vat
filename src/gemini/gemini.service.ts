
import { Injectable, BadRequestException } from '@nestjs/common';
import { Invoice, InvoiceItem, InvoiceStatus, ClaimableStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

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

        // 2. Categorize Items & Fiscalize
        const fiscalizedItems = invoice.items.map(item => {
            let category = VatCategory.STANDARD;
            let rate = vatRate.STANDARD;

            // Ensure description exists
            const desc = (item.description || '').toLowerCase();

            if (desc.includes('zero') || desc.includes('0%')) {
                category = VatCategory.ZERO_RATED;
                rate = vatRate.ZERO_RATED;
            } else if (desc.includes('exempt')) {
                category = VatCategory.EXEMPT;
                rate = vatRate.EXEMPT;
            }

            return {
                ...item,
                vatCategory: category,
                vatRate: rate
            };
        });

        const mainCategory = fiscalizedItems.some(i => i.vatCategory === VatCategory.STANDARD)
            ? VatCategory.STANDARD
            : (fiscalizedItems[0]?.vatCategory || VatCategory.STANDARD);

        return {
            status: InvoiceStatus.FISCALIZED,
            irn: randomUUID(),
            fiscalizedAt: new Date(),
            vatCategory: mainCategory,
            claimableStatus: ClaimableStatus.CLAIMABLE,
            items: fiscalizedItems,
            rejectionReason: null
        };
    }
}
