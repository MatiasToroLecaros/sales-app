import { IsNotEmpty, IsNumber, IsPositive, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ description: 'Quantity sold', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 499.99 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiProperty({ description: 'Sale date', example: '2023-04-25T14:30:00Z' })
  @IsNotEmpty()
  @IsDateString()
  date: Date;
}