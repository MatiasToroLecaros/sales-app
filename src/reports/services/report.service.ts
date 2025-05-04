import { Injectable } from '@nestjs/common';
import { SalesService } from '../../sales/services/sales.service';
import { GenerateReportDto, ReportFormat } from '../dto/generate-report.dto';
import { PdfService } from './pdf.service';
import { Report, ReportData, JsonReport } from '../interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(
    private readonly salesService: SalesService,
    private readonly pdfService: PdfService,
  ) {}

  async generateReport(generateReportDto: GenerateReportDto): Promise<Report> {
    const reportData = await this.prepareReportData(generateReportDto);

    switch (generateReportDto.format) {
      case ReportFormat.JSON:
        return this.generateJsonReport(reportData);
      case ReportFormat.PDF:
        return this.pdfService.generatePdf(reportData);
      default:
        return this.generateJsonReport(reportData);
    }
  }

  private async prepareReportData(dto: GenerateReportDto): Promise<ReportData> {
    const { startDate, endDate, productId } = dto;

    const salesData = await this.salesService.findFiltered({
      startDate,
      endDate,
      productId,
    });

    const metrics = await this.salesService.getMetrics();
    const hasData = salesData.length > 0;

    return {
      generatedAt: new Date().toISOString(),
      filters: {
        startDate: startDate || 'No start date specified',
        endDate: endDate || 'No end date specified',
        productId: productId || 'All products',
      },
      hasData,
      message: hasData
        ? 'Report generated successfully'
        : 'No data found for the specified criteria',
      summary: {
        totalSales: metrics.totalSales ?? 0,
        totalItems: salesData.reduce((sum, sale) => sum + sale.quantity, 0),
        averageOrderValue: hasData
          ? (metrics.totalSales ?? 0) / salesData.length
          : 0,
      },
      details: salesData,
    };
  }

  private generateJsonReport(data: ReportData): JsonReport {
    return {
      format: 'json',
      content: data,
    };
  }
}
