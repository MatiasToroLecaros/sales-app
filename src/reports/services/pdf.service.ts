import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { ReportData, PdfReport } from '../interfaces/report.interface';

@Injectable()
export class PdfService {
  async generatePdf(data: ReportData): Promise<PdfReport> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        
        doc.on('end', () => {
          const result = Buffer.concat(chunks);
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

        this.addReportHeader(doc, data);
        this.addFiltersSection(doc, data);
        
        if (!data.hasData) {
          this.addNoDataMessage(doc);
        } else {
          this.addSummarySection(doc, data);
          this.addDetailsSection(doc, data);
        }
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addReportHeader(doc: PDFKit.PDFDocument, data: ReportData): void {
    doc.fontSize(20).text('SALES REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`);
    doc.moveDown();
  }

  private addFiltersSection(doc: PDFKit.PDFDocument, data: ReportData): void {
    doc.fontSize(16).text('FILTERS', { underline: true });
    doc.fontSize(12)
      .text(`Start Date: ${data.filters.startDate}`)
      .text(`End Date: ${data.filters.endDate}`)
      .text(`Product: ${data.filters.productId}`);
    doc.moveDown();
  }

  private addNoDataMessage(doc: PDFKit.PDFDocument): void {
    doc.fontSize(14).text('No sales data found for the specified criteria.', { align: 'center' });
  }

  private addSummarySection(doc: PDFKit.PDFDocument, data: ReportData): void {
    doc.fontSize(16).text('SUMMARY', { underline: true });
    doc.fontSize(12)
      .text(`Total Sales: $${Number(data.summary.totalSales).toFixed(2)}`)
      .text(`Total Items: ${data.summary.totalItems}`)
      .text(`Average Order Value: $${Number(data.summary.averageOrderValue).toFixed(2)}`);
    doc.moveDown();
  }

  private addDetailsSection(doc: PDFKit.PDFDocument, data: ReportData): void {
    doc.fontSize(16).text('DETAILS', { underline: true });
    let yPosition = doc.y + 10;
    const itemHeight = 90;

    data.details.forEach((item) => {
      if (yPosition + itemHeight > doc.page.height - 50) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(12)
        .text(`ID: ${item.id}`)
        .text(`Date: ${new Date(item.date).toLocaleDateString()}`)
        .text(`Product: ${item.product?.name || 'Unknown product'}`)
        .text(`Quantity: ${item.quantity}`)
        .text(`Unit Price: $${Number(item.unitPrice).toFixed(2)}`)
        .text(`Total: $${Number(item.quantity * item.unitPrice).toFixed(2)}`);

      doc.moveDown()
        .text('------------------------')
        .moveDown();

      yPosition += itemHeight;
    });
  }
}