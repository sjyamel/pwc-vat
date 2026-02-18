
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class VatService {
    constructor(private prisma: PrismaService) { }

    async getSummary(organizationId: string, year: number, month: number) {
        // Calculate on the fly for accuracy as requested
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const sales = await this.prisma.invoice.aggregate({
            where: {
                organizationId,
                type: 'SALES',
                status: 'FISCALIZED',
                fiscalizedAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                vatAmount: true,
            },
            _count: {
                id: true
            }
        });

        const purchases = await this.prisma.invoice.aggregate({
            where: {
                organizationId,
                type: 'PURCHASE',
                status: 'FISCALIZED',
                claimableStatus: 'CLAIMABLE',
                fiscalizedAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                vatAmount: true,
            }
        });

        const totalOutputVat = sales._sum.vatAmount || 0;
        const totalInputVat = purchases._sum.vatAmount || 0;
        const vatPayable = totalOutputVat - totalInputVat;
        const fiscalizedCount = sales._count.id || 0;

        // Upsert summary for caching/persistence purposes if needed, or just return
        const summary = await this.prisma.vatSummary.upsert({
            where: {
                organizationId_periodYear_periodMonth: {
                    organizationId,
                    periodYear: year,
                    periodMonth: month,
                }
            },
            update: {
                totalOutputVat,
                totalClaimableInputVat: totalInputVat,
                vatPayable,
                fiscalizedCount,
                lastCalculated: new Date()
            },
            create: {
                organizationId,
                periodYear: year,
                periodMonth: month,
                totalOutputVat,
                totalClaimableInputVat: totalInputVat,
                vatPayable,
                fiscalizedCount,
                excludedCount: 0
            }
        });

        return summary;
    }

    async getBreakdown(organizationId: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return this.prisma.invoice.findMany({
            where: {
                // organizationId,
                fiscalizedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }

    async export(organizationId: string, year: number, month: number, format: 'PDF' | 'CSV') {
        const data = await this.getBreakdown(organizationId, year, month);

        if (format === 'CSV') {
            const { Parser } = require('json2csv');
            const parser = new Parser();
            const csv = parser.parse(data);
            return {
                buffer: Buffer.from(csv),
                filename: `vat_report_${year}_${month}.csv`,
                mimeType: 'text/csv'
            };
        } else {
            const PDFDocument = require('pdfkit-table');
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            const buffers: any[] = [];

            doc.on('data', buffers.push.bind(buffers));

            // Header
            doc.fontSize(20).text(`VAT Report - ${month}/${year}`, { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`Organization ID: ${organizationId}`);
            doc.moveDown();

            // Table
            const table = {
                title: "Invoice Breakdown",
                headers: [
                    { label: "Invoice No", property: 'invoiceNumber', width: 100 },
                    { label: "Date", property: 'date', width: 100 },
                    { label: "Total", property: 'totalPayable', width: 100 },
                    { label: "VAT", property: 'vatAmount', width: 100 },
                    { label: "Irn", property: 'irn', width: 130 }
                ],
                datas: data.map((item: any) => ({
                    invoiceNumber: item.invoiceNumber,
                    date: (item.fiscalizedAt || item.createdAt || '').toString().split('T')[0],
                    totalPayable: (item.totalPayable || 0).toFixed(2),
                    vatAmount: (item.vatAmount || 0).toFixed(2),
                    irn: (item.irn || 'N/A').substring(0, 8) + '...'
                })),
            };

            await doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
                prepareRow: (row, indexColumn, indexRow, rect, rectRow) => {
                    doc.font("Helvetica").fontSize(10);
                    indexColumn === 0 && doc.addBackground(rectRow, (indexRow % 2 ? 'blue' : 'green'), 0.15);
                },
            });

            doc.end();

            return new Promise((resolve) => {
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve({
                        buffer: pdfData,
                        filename: `vat_report_${year}_${month}.pdf`,
                        mimeType: 'application/pdf'
                    });
                });
            });
        }
    }
}
