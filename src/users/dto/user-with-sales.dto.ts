import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

// DTO to represent simplified sale data
class SaleResponseDto {
  @ApiProperty({ description: 'Sale ID' })
  id: number;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiProperty({ description: 'Quantity sold' })
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: number;

  @ApiProperty({ description: 'Total sale amount' })
  total: number;

  @ApiProperty({ description: 'Sale date' })
  date: Date;
}

export class UserWithSalesDto extends UserResponseDto {
  @Expose()
  @Type(() => SaleResponseDto)
  @ApiProperty({
    description: 'User purchases',
    type: [SaleResponseDto],
    isArray: true
  })
  purchases: SaleResponseDto[];
}