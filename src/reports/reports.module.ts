import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/report.service';
import { SalesModule } from '../sales/sales.module';
import { ProductsModule } from '../products/products.module';
import { PdfService } from './services/pdf.service';

@Module({
  imports: [SalesModule, ProductsModule],
  controllers: [ReportsController],
  providers: [ReportsService, PdfService],
})
export class ReportsModule {}