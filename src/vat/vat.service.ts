
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VatService {
    constructor(private prisma: PrismaService) { }

    async getSummary(organizationId: string, year: number, month: number) {
        return this.prisma.vatSummary.findFirst({
            where: {
                organizationId,
                periodYear: year,
                periodMonth: month,
            },
        });
    }

    async getBreakdown(organizationId: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return this.prisma.invoice.findMany({
            where: {
                organizationId,
                fiscalizedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
    }

    async export(organizationId: string, year: number, month: number, format: 'PDF' | 'CSV') {
        // Mock export
        return {
            message: `Exporting ${format} for ${year}-${month}`,
            status: 'QUEUED',
        };
    }
}
