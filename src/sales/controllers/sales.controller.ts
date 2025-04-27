// backend/src/sales/sales.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards,
    Query,
    ParseIntPipe
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
  import { SalesService } from '../services/sales.service';
  import { CreateSaleDto } from '../dto/create-sale.dto';
  import { UpdateSaleDto } from '../dto/update-sale.dto';
  import { FilterSalesDto } from '../dto/filter-sales.dto';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  
  @ApiTags('sales')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('sales')
  export class SalesController {
    constructor(private readonly salesService: SalesService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new sale' })
    @ApiResponse({ status: 201, description: 'Sale created successfully' })
    create(@Body() createSaleDto: CreateSaleDto) {
      return this.salesService.create(createSaleDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all sales or filter by criteria' })
    @ApiResponse({ status: 200, description: 'Returns all matching sales' })
    findAll(@Query() filterDto: FilterSalesDto) {
      if (Object.keys(filterDto).length > 0) {
        return this.salesService.findFiltered(filterDto);
      }
      return this.salesService.findAll();
    }
  
    @Get('metrics')
    @ApiOperation({ summary: 'Get sales metrics and statistics' })
    @ApiResponse({ status: 200, description: 'Returns sales metrics' })
    getMetrics() {
      return this.salesService.getMetrics();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a sale by ID' })
    @ApiResponse({ status: 200, description: 'Returns the sale' })
    @ApiResponse({ status: 404, description: 'Sale not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.salesService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a sale' })
    @ApiResponse({ status: 200, description: 'Sale updated successfully' })
    @ApiResponse({ status: 404, description: 'Sale not found' })
    update(
      @Param('id', ParseIntPipe) id: number, 
      @Body() updateSaleDto: UpdateSaleDto
    ) {
      return this.salesService.update(id, updateSaleDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a sale' })
    @ApiResponse({ status: 200, description: 'Sale deleted successfully' })
    @ApiResponse({ status: 404, description: 'Sale not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
      await this.salesService.remove(id);
      return { message: 'Sale deleted' };
    }
  }