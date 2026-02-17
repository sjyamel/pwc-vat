
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '@prisma/client';

@Controller('v1/invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Get()
    findAll(@Query('status') status?: InvoiceStatus) {
        return this.invoicesService.findAll(status);
    }

    @Post(':id/submit')
    submit(@Param('id') id: string) {
        return this.invoicesService.submit(id);
    }

    @Get('fiscalized')
    findFiscalized() {
        return this.invoicesService.findFiscalized();
    }
}
