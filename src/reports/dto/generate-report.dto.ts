import { IsNotEmpty, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportFormat {
  JSON = 'json',
  PDF = 'pdf',
}

export class GenerateReportDto {
  @ApiProperty({ 
    description: 'Report format', 
    enum: ReportFormat,
    example: ReportFormat.PDF 
  })
  @IsNotEmpty()
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiProperty({ 
    required: false, 
    description: 'Start date',
    example: '2023-01-01T00:00:00Z' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    required: false, 
    description: 'End date',
    example: '2023-12-31T23:59:59Z' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Product ID',
    example: 1 
  })
  @IsOptional()
  @IsNumber()
  productId?: number;
}