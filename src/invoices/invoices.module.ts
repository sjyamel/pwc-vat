
import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaService } from '../prisma/prisma.service'; // Assuming PrismaService is in a shared module or provided globally, but importing here for safety if not global w/o module
import { GeminiModule } from '../gemini/gemini.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [GeminiModule, PrismaModule],
    controllers: [InvoicesController],
    providers: [InvoicesService],
})
export class InvoicesModule { }
