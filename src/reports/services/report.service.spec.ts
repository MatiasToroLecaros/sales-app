import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './report.service';
import { PdfService } from './pdf.service';
import { SalesService } from '../../sales/services/sales.service';
import { ReportFormat } from '../dto/generate-report.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let salesService: SalesService;
  let pdfService: PdfService;

  const mockSalesService = {
    findFiltered: jest.fn(),
    getMetrics: jest.fn(),
  };

  const mockPdfService = {
    generatePdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    salesService = module.get<SalesService>(SalesService);
    pdfService = module.get<PdfService>(PdfService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    const mockSalesData = [
      {
        id: 1,
        quantity: 2,
        unitPrice: 100,
        date: new Date('2024-01-01'),
        product: { name: 'Test Product' },
      },
    ];

    const mockMetrics = {
      totalSales: 200,
    };

    beforeEach(() => {
      mockSalesService.findFiltered.mockResolvedValue(mockSalesData);
      mockSalesService.getMetrics.mockResolvedValue(mockMetrics);
    });

    it('should generate JSON report', async () => {
      const result = await service.generateReport({
        format: ReportFormat.JSON,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        productId: 1,
      });

      expect(result.format).toBe('json');
      expect(result.content).toEqual(
        expect.objectContaining({
          hasData: true,
          message: 'Report generated successfully',
          summary: {
            totalSales: 200,
            totalItems: 2,
            averageOrderValue: 200,
          },
        }),
      );
    });

    it('should generate PDF report', async () => {
      const mockPdfResult = {
        format: 'pdf',
        content: Buffer.from('test'),
        contentType: 'application/pdf',
        filename: 'test.pdf',
        metadata: {
          title: 'Sales Report',
          author: 'Sales Management System',
          creationDate: expect.any(String),
        },
      };

      mockPdfService.generatePdf.mockResolvedValue(mockPdfResult);

      const result = await service.generateReport({
        format: ReportFormat.PDF,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        productId: 1,
      });

      expect(result).toEqual(mockPdfResult);
      expect(pdfService.generatePdf).toHaveBeenCalled();
    });

    it('should handle empty sales data', async () => {
      mockSalesService.findFiltered.mockResolvedValue([]);

      const result = await service.generateReport({
        format: ReportFormat.JSON,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.format).toBe('json');
      expect(result.content).toEqual(
        expect.objectContaining({
          hasData: false,
          message: 'No data found for the specified criteria',
          summary: {
            totalSales: 0,
            totalItems: 0,
            averageOrderValue: 0,
          },
        }),
      );
    });
  });
});