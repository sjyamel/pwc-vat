
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus, ClaimableStatus, VatCategory } from '@prisma/client';
import { vatRate } from 'src/@nest/usual';

@Injectable()
export class InvoicesService {
    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto) {
        const new_invoice = await this.prisma.invoice.create({
            data: {
                ...createInvoiceDto,
                status: InvoiceStatus.PENDING,
                vatCategory: VatCategory.STANDARD,
                claimableStatus: ClaimableStatus.REVIEW_REQUIRED,
                vatAmount: vatRate[VatCategory.STANDARD],
                items: createInvoiceDto.items.map(item => ({
                    ...item,
                    vatRate: vatRate[VatCategory.STANDARD], // Default to Standard rate
                    vatCategory: VatCategory.STANDARD
                }))
            },
        });
        const fiscalizationResult = await this.submit(new_invoice.id);
        await this.prisma.invoice.update({
            where: { id: new_invoice.id },
            data: {
                status: fiscalizationResult.status,
                fiscalizedAt: fiscalizationResult.fiscalizedAt,
                irn: fiscalizationResult.irn,
                vatCategory: fiscalizationResult.vatCategory,
                // vatRate: fiscalizationResult.vatAmount / 100,
                vatAmount: fiscalizationResult.vatAmount,
                claimableStatus: fiscalizationResult.claimableStatus,
                items: fiscalizationResult.items,
                rejectionReason: fiscalizationResult.rejectionReason,
                qrCodeUrl: fiscalizationResult.qrCodeUrl,
            },
        });
        return {
            invoice: new_invoice,
            fiscalizationResult
        }
    }

    async findAll(status?: InvoiceStatus) {
        return this.prisma.invoice.findMany({
            where: status ? { status } : {},
        });
    }

    async submit(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { organization: true },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        const fiscalizationResult = await this.gemini.fiscalize(invoice);

        const updatedInvoice = await this.prisma.invoice.update({
            where: { id },
            data: {
                // Explicitly set fields to ensure they are updated
                status: fiscalizationResult.status,
                fiscalizedAt: fiscalizationResult.fiscalizedAt,
                irn: fiscalizationResult.irn,
                vatCategory: fiscalizationResult.vatCategory,
                claimableStatus: fiscalizationResult.claimableStatus,
                items: fiscalizationResult.items,
                rejectionReason: fiscalizationResult.rejectionReason,
                qrCodeUrl: fiscalizationResult.qrCodeUrl,
            },
        });

        if (updatedInvoice.status === InvoiceStatus.FISCALIZED) {
            // await this.updateVatSummary(updatedInvoice);
        }

        return updatedInvoice;
    }

    async findFiscalized() {
        return this.prisma.invoice.findMany({
            where: { status: InvoiceStatus.FISCALIZED },
        });
    }

    //     private async updateVatSummary(invoice: any) {
    //         const date = invoice.fiscalizedAt || new Date();
    //         const periodYear = date.getFullYear();
    //         const periodMonth = date.getMonth() + 1;
    // 
    //         const summary = await this.prisma.vatSummary.findFirst({
    //             where: {
    //                 organizationId: invoice.organizationId,
    //                 periodYear,
    //                 periodMonth,
    //             },
    //         });
    // 
    //         let newOutputVat = (summary?.totalOutputVat || 0);
    //         let newInputVat = (summary?.totalClaimableInputVat || 0);
    // 
    //         if (invoice.type === 'SALES') {
    //             newOutputVat += invoice.vatAmount;
    //         } else if (invoice.type === 'PURCHASE') {
    //             if (invoice.claimableStatus === ClaimableStatus.CLAIMABLE) {
    //                 newInputVat += invoice.vatAmount;
    //             }
    //         }
    // 
    //         const vatPayable = newOutputVat - newInputVat;
    // 
    //         if (summary) {
    //             await this.prisma.vatSummary.update({
    //                 where: { id: summary.id },
    //                 data: {
    //                     totalOutputVat: newOutputVat,
    //                     totalClaimableInputVat: newInputVat,
    //                     vatPayable,
    //                     fiscalizedCount: (summary.fiscalizedCount || 0) + 1,
    //                     lastCalculated: new Date(),
    //                 },
    //             });
    //         } else {
    //             await this.prisma.vatSummary.create({
    //                 data: {
    //                     organizationId: invoice.organizationId,
    //                     periodYear,
    //                     periodMonth,
    //                     totalOutputVat: newOutputVat,
    //                     totalClaimableInputVat: newInputVat,
    //                     vatPayable,
    //                     fiscalizedCount: 1,
    //                     excludedCount: 0,
    //                 },
    //             });
    //         }
    //     }
}
