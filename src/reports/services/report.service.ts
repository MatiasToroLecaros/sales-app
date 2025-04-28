import { Injectable } from '@nestjs/common';
import { SalesService } from '../../sales/services/sales.service';
import { GenerateReportDto, ReportFormat } from '../dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly salesService: SalesService) {}

  async generateReport(generateReportDto: GenerateReportDto): Promise<any> {
    const { format, startDate, endDate, productId } = generateReportDto;

    // Get filtered sales data
    const salesData = await this.salesService.findFiltered({
      startDate,
      endDate,
      productId,
    });

    // Get additional metrics
    const metrics = await this.salesService.getMetrics();

    // Verificar si hay datos
    const hasData = salesData.length > 0;

    // Create the report data structure
    const reportData = {
      generatedAt: new Date().toISOString(),
      filters: {
        startDate: startDate || 'No start date specified',
        endDate: endDate || 'No end date specified',
        productId: productId || 'All products',
      },
      hasData: hasData,
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

    // Generate the report in the requested format
    switch (format) {
      case ReportFormat.JSON:
        return this.generateJsonReport(reportData);
      case ReportFormat.PDF:
        return this.generatePdfReport(reportData);
      default:
        return reportData;
    }
  }

  private generateJsonReport(data: any): any {
    // Simply return the structured data for JSON format
    return {
      format: 'json',
      content: data,
    };
  }

  private generatePdfReport(data: any): any {
    // Build a text representation that simulates PDF content
    let pdfContent = `
      SALES REPORT
      ============
      
      Generated: ${data.generatedAt}
      
      FILTERS
      -------
      Start Date: ${data.filters.startDate}
      End Date: ${data.filters.endDate}
      Product: ${data.filters.productId}
      
      SUMMARY
      -------
    `;

    if (!data.hasData) {
      pdfContent += `
      No sales data found for the specified criteria.
      `;
    } else {
      pdfContent += `
      Total Sales: $${Number(data.summary.totalSales || 0).toFixed(2)}
      Total Items: ${data.summary.totalItems}
      Average Order Value: $${Number(data.summary.averageOrderValue || 0).toFixed(2)}
      
      DETAILS
      -------
      ${data.details
        .map(
          (item) =>
            `ID: ${item.id}
         Date: ${new Date(item.date).toLocaleDateString()}
         Product: ${item.product}
         Quantity: ${item.quantity}
         Unit Price: $${Number(item.unitPrice || 0).toFixed(2)}
         Total: $${Number((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
         ------------------------`,
        )
        .join('\n')}
      `;
    }

    return {
      format: 'pdf',
      content: pdfContent.trim(),
      metadata: {
        title: 'Sales Report',
        author: 'Sales Management System',
        creationDate: data.generatedAt,
      },
    };
  }
}
