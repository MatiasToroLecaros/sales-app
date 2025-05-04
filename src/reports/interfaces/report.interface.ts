export interface ReportFilters {
    startDate: string | 'No start date specified';
    endDate: string | 'No end date specified';
    productId: number | 'All products';
  }
  
  export interface ReportSummary {
    totalSales: number;
    totalItems: number;
    averageOrderValue: number;
  }
  
  export interface ReportData {
    generatedAt: string;
    filters: ReportFilters;
    hasData: boolean;
    message: string;
    summary: ReportSummary;
    details: any[]; // Podríamos crear una interfaz específica para los detalles si es necesario
  }
  
  export interface JsonReport {
    format: 'json';
    content: ReportData;
  }
  
  export interface PdfReport {
    format: 'pdf';
    content: Buffer;
    contentType: 'application/pdf';
    filename: string;
    metadata: {
      title: string;
      author: string;
      creationDate: string;
    };
  }
  
  export type Report = JsonReport | PdfReport;