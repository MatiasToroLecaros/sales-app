import { Controller, Post, Body, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from '../services/report.service';
import { GenerateReportDto, ReportFormat } from '../dto/generate-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Report, PdfReport, JsonReport } from '../interfaces/report.interface';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a sales report' })
  @ApiResponse({ 
    status: 201, 
    description: 'Report generated successfully',
  })
  async generateReport(
    @Body() generateReportDto: GenerateReportDto,
    @Res() response: Response
  ) {
    const report = await this.reportsService.generateReport(generateReportDto);
    
    if (generateReportDto.format === ReportFormat.PDF) {
      const pdfReport = report as PdfReport;
      response.setHeader('Content-Type', pdfReport.contentType);
      response.setHeader('Content-Disposition', `attachment; filename=${pdfReport.filename}`);
      return response.send(pdfReport.content);
    } else {
      const jsonReport = report as JsonReport;
      return response.json(jsonReport);
    }
  }
}