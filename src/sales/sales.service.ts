// backend/src/sales/sales.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { FilterSalesDto } from './dto/filter-sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {
    // Inicializar datos de ejemplo (simulando integración con Google Sheets)
    this.initializeSampleData();
  }

  /**
   * Simulates the integration with an external data source like Google Sheets
   * by populating the database with sample sales data
   */
  private async initializeSampleData() {
    // Check if we already have sales data
    const count = await this.saleRepository.count();
    if (count > 0) return;

    // Sample sales data (simulating data from Google Sheets)
    const sampleData: CreateSaleDto[] = [
      { productId: 1, quantity: 5, unitPrice: 199.99, date: new Date('2023-01-15') },
      { productId: 2, quantity: 2, unitPrice: 499.99, date: new Date('2023-01-20') },
      { productId: 1, quantity: 3, unitPrice: 199.99, date: new Date('2023-02-05') },
      { productId: 3, quantity: 1, unitPrice: 999.99, date: new Date('2023-02-15') },
      { productId: 2, quantity: 4, unitPrice: 499.99, date: new Date('2023-03-10') },
    ];

    // Create and save each sample sale
    for (const saleData of sampleData) {
      const sale = this.saleRepository.create(saleData);
      await this.saleRepository.save(sale);
    }
  }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const sale = this.saleRepository.create(createSaleDto);
    return this.saleRepository.save(sale);
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find({ relations: ['product'] });
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOne({ 
      where: { id }, 
      relations: ['product'] 
    });
    
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.saleRepository.preload({
      id,
      ...updateSaleDto,
    });
    
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    
    return this.saleRepository.save(sale);
  }

  async remove(id: number): Promise<void> {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);
  }

  async findFiltered(filterDto: FilterSalesDto): Promise<Sale[]> {
    const { startDate, endDate, productId } = filterDto;
    const query = this.saleRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.product', 'product');
    
    // Apply filters if provided
    if (startDate && endDate) {
      query.andWhere('sale.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      query.andWhere('sale.date >= :startDate', { 
        startDate: new Date(startDate) 
      });
    } else if (endDate) {
      query.andWhere('sale.date <= :endDate', { 
        endDate: new Date(endDate) 
      });
    }
    
    if (productId) {
      query.andWhere('sale.productId = :productId', { productId });
    }
    
    return query.getMany();
  }

  async getMetrics(): Promise<any> {
    // Total sales amount
    const totalQuery = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.quantity * sale.unitPrice)', 'total')
      .getRawOne();
    
    // Sales by product
    const salesByProductQuery = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.product', 'product')
      .select('product.name', 'productName')
      .addSelect('SUM(sale.quantity)', 'totalQuantity')
      .addSelect('SUM(sale.quantity * sale.unitPrice)', 'totalAmount')
      .groupBy('product.name')
      .getRawMany();
    
    // Monthly sales
    const monthlySalesQuery = await this.saleRepository
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.date, 'YYYY-MM')", 'month')
      .addSelect('SUM(sale.quantity * sale.unitPrice)', 'totalAmount')
      .groupBy("TO_CHAR(sale.date, 'YYYY-MM')")
      .orderBy("TO_CHAR(sale.date, 'YYYY-MM')")
      .getRawMany();
    
    return {
      totalSales: totalQuery.total || 0,
      salesByProduct: salesByProductQuery,
      monthlySales: monthlySalesQuery,
    };
  }
}