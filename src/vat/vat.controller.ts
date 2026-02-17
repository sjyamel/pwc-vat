
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { VatService } from './vat.service';
import { User } from 'src/@nest/uncommon';
// import { UserType } from 'src/@nest/usual';
// 
@Controller('v1/vat')
export class VatController {
    constructor(private readonly vatService: VatService) { }

    @Get('summary')
    getSummary(
        @User() user: any,
        @Query('year') year: number,
        @Query('month') month: number,
    ) {
        return this.vatService.getSummary(user.organizationId, Number(year), Number(month));
    }

    @Get('breakdown')
    getBreakdown(
        @User() user: any,
        @Query('year') year: number,
        @Query('month') month: number,
    ) {
        return this.vatService.getBreakdown(user.organizationId, Number(year), Number(month));
    }

    @Post('export')
    export(
        @User() user: any,
        @Body('year') year: number,
        @Body('month') month: number,
        @Body('format') format: 'PDF' | 'CSV',
    ) {
        return this.vatService.export(user.organizationId, Number(year), Number(month), format);
    }
}
