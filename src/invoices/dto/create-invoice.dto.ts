
import { IsString, IsNumber, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType, VatCategory } from '@prisma/client';

export class InvoiceItemDto {
    @IsString()
    description: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    unitPrice: number;

    @IsEnum(VatCategory)
    vatCategory: VatCategory;

    @IsNumber()
    vatRate: number;
}

export class CreateInvoiceDto {
    @IsString()
    organizationId: string;

    @IsEnum(InvoiceType)
    type: InvoiceType;

    @IsString()
    invoiceNumber: string;

    @IsNumber()
    netAmount: number;

    @IsNumber()
    vatAmount: number;

    @IsNumber()
    totalPayable: number;

    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];
}
