import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { InvoicesModule } from './invoices/invoices.module';
import { VatModule } from './vat/vat.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { OrganizationController } from './organization/organization.controller';
import { OrganizationModule } from './organization/organization.module';
import { OrganizationService } from './organization/organization.service';

@Module({
  imports: [AuthModule, PrismaModule, InvoicesModule, VatModule, OrganizationModule],
  controllers: [AppController, OrganizationController],
  providers: [AppService, OrganizationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
