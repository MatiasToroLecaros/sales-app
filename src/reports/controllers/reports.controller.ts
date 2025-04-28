import { Controller, Post, Body, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from '../services/report.service';
import { GenerateReportDto, ReportFormat } from '../dto/generate-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

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
    description: 'Report generated successfully' 
  })
  async generateReport(
    @Body() generateReportDto: GenerateReportDto,
    @Res() response: Response
  ) {
    const report = await this.reportsService.generateReport(generateReportDto);
    
    if (generateReportDto.format === ReportFormat.PDF && report.contentType === 'application/pdf') {
      // Configurar headers para la descarga de PDF
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
      return response.send(report.content);
    } else {
      // Para formato JSON o en caso de no poder generar PDF
      return response.json(report);
    }
  }
}