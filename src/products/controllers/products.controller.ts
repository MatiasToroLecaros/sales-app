import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ProductsService } from '../services/products.service';
  import { CreateProductDto, UpdateProductDto } from '../dto/products.dto';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('products')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ 
      status: 200, 
      description: 'Returns all products',
    })
    findAll() {
      return this.productsService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Returns the product' 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'Product not found' 
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.productsService.findOne(id);
    }
  
    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ 
      status: 201, 
      description: 'Product created successfully' 
    })
    create(@Body() dto: CreateProductDto) {
      return this.productsService.create(dto);
    }
  
    @Put(':id')
    @ApiOperation({ summary: 'Update a product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Product updated successfully' 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'Product not found' 
    })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
      return this.productsService.update(id, dto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Product deleted successfully' 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'Product not found' 
    })
    delete(@Param('id', ParseIntPipe) id: number) {
      this.productsService.remove(id);
      return { message: 'Product deleted' };
    }
  }
  