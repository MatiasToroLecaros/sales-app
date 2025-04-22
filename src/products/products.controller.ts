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
  import { ProductsService } from './products.service';
  import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('products')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Get()
    findAll() {
      return this.productsService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.productsService.findOne(id);
    }
  
    @Post()
    create(@Body() dto: CreateProductDto) {
      return this.productsService.create(dto);
    }
  
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
      return this.productsService.update(id, dto);
    }
  
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
      this.productsService.remove(id);
      return { message: 'Product deleted' };
    }
  }
  