import { Injectable } from '@nestjs/common';
import { SalesService } from '../../sales/services/sales.service';
import { GenerateReportDto, ReportFormat } from '../dto/generate-report.dto';
import * as PDFDocument from 'pdfkit';

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

  private async generatePdfReport(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Crear un documento PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Buffer para almacenar el PDF
        const chunks: Buffer[] = [];
        let result;
        
        // Capturar todos los segmentos del PDF
        doc.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        // Cuando el PDF está completo, resolver la promesa
        doc.on('end', () => {
          result = Buffer.concat(chunks);
          resolve({
            format: 'pdf',
            content: result,
            contentType: 'application/pdf',
            filename: `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            metadata: {
              title: 'Sales Report',
              author: 'Sales Management System',
              creationDate: data.generatedAt,
            },
          });
        });
        
        // Diseñar el PDF
        
        // Título
        doc.fontSize(20).text('SALES REPORT', { align: 'center' });
        doc.moveDown();
        
        // Fecha de generación
        doc.fontSize(12).text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`);
        doc.moveDown();
        
        // Filtros
        doc.fontSize(16).text('FILTERS', { underline: true });
        doc.fontSize(12).text(`Start Date: ${data.filters.startDate}`);
        doc.text(`End Date: ${data.filters.endDate}`);
        doc.text(`Product: ${data.filters.productId}`);
        doc.moveDown();
        
        // Si no hay datos, mostrar mensaje
        if (!data.hasData) {
          doc.fontSize(14).text('No sales data found for the specified criteria.', { align: 'center' });
        } else {
          // Resumen
          doc.fontSize(16).text('SUMMARY', { underline: true });
          doc.fontSize(12).text(`Total Sales: $${Number(data.summary.totalSales).toFixed(2)}`);
          doc.text(`Total Items: ${data.summary.totalItems}`);
          doc.text(`Average Order Value: $${Number(data.summary.averageOrderValue).toFixed(2)}`);
          doc.moveDown();
          
          // Detalles
          doc.fontSize(16).text('DETAILS', { underline: true });
          
          // Tabla de ventas
          let yPosition = doc.y + 10;
          const itemHeight = 90;
          
          // Por cada venta, añadir detalles
          data.details.forEach((item: any) => {
            // Verificar si necesitamos una nueva página
            if (yPosition + itemHeight > doc.page.height - 50) {
              doc.addPage();
              yPosition = 50;
            }
            
            doc.fontSize(12).text(`ID: ${item.id}`, { continued: false });
            doc.text(`Date: ${new Date(item.date).toLocaleDateString()}`, { continued: false });
            doc.text(`Product: ${item.product?.name || 'Unknown product'}`, { continued: false });
            doc.text(`Quantity: ${item.quantity}`, { continued: false });
            doc.text(`Unit Price: $${Number(item.unitPrice).toFixed(2)}`, { continued: false });
            doc.text(`Total: $${Number(item.quantity * item.unitPrice).toFixed(2)}`, { continued: false });
            
            // Línea separadora
            doc.moveDown();
            doc.text('------------------------');
            doc.moveDown();
            
            yPosition += itemHeight;
          });
        }
        
        // Finalizar el documento
        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }
}
