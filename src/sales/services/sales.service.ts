// backend/src/sales/sales.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import { FilterSalesDto } from '../dto/filter-sales.dto';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Initialize sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // First check if we already have products data
    const productCount = await this.productRepository.count();
    if (productCount === 0) {
      // Create sample products first
      const sampleProducts = [
        { name: 'Laptop Pro', description: 'High-end laptop for professionals' },
        { name: 'Smartphone X', description: 'Latest smartphone with advanced features' },
        { name: 'Tablet Ultra', description: 'Ultra-thin tablet with high resolution display' },
      ];

      for (const productData of sampleProducts) {
        const product = this.productRepository.create(productData);
        await this.productRepository.save(product);
      }
    }

    // Check for users
    const userCount = await this.userRepository.count();
    if (userCount === 0) {
      // Create admin user
      const adminUser = this.userRepository.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'admin123', // In a real application, this would be hashed
      });
      await this.userRepository.save(adminUser);
    }

    // Then check if we already have sales data
    const salesCount = await this.saleRepository.count();
    if (salesCount > 0) return;

    // Get all products and the admin user
    const products = await this.productRepository.find();
    const adminUser = await this.userRepository.findOne({ where: { email: 'admin@example.com' } });
    
    if (products.length === 0 || !adminUser) return;

    // Sample sales data (simulating data from Google Sheets)
    const sampleData = [
      { productId: products[0].id, userId: adminUser.id, quantity: 5, unitPrice: 199.99, date: new Date('2023-01-15') },
      { productId: products[1].id, userId: adminUser.id, quantity: 2, unitPrice: 499.99, date: new Date('2023-01-20') },
      { productId: products[0].id, userId: adminUser.id, quantity: 3, unitPrice: 199.99, date: new Date('2023-02-05') },
      { productId: products[2].id, userId: adminUser.id, quantity: 1, unitPrice: 999.99, date: new Date('2023-02-15') },
      { productId: products[1].id, userId: adminUser.id, quantity: 4, unitPrice: 499.99, date: new Date('2023-03-10') },
    ];

    // Create and save each sample sale
    for (const saleData of sampleData) {
      const sale = this.saleRepository.create(saleData);
      await this.saleRepository.save(sale);
    }
  }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Verify product exists
    const product = await this.productRepository.findOne({ where: { id: createSaleDto.productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${createSaleDto.productId} not found`);
    }

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: createSaleDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createSaleDto.userId} not found`);
    }

    const sale = this.saleRepository.create(createSaleDto);
    return this.saleRepository.save(sale);
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find({ 
      relations: ['product', 'user'] 
    });
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOne({ 
      where: { id }, 
      relations: ['product', 'user'] 
    });
    
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    // Verify product exists if productId is being updated
    if (updateSaleDto.productId) {
      const product = await this.productRepository.findOne({ where: { id: updateSaleDto.productId } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${updateSaleDto.productId} not found`);
      }
    }

    // Verify user exists if userId is being updated
    if (updateSaleDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateSaleDto.userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${updateSaleDto.userId} not found`);
      }
    }

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
    const { startDate, endDate, productId, userId } = filterDto;
    const query = this.saleRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.product', 'product')
      .leftJoinAndSelect('sale.user', 'user');
    
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

    if (userId) {
      query.andWhere('"sale"."ID_USUARIO" = :userId', { userId });
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
    
    // Sales by user
    const salesByUserQuery = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.user', 'user')
      .select('user.name', 'userName')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.quantity * sale.unitPrice)', 'totalAmount')
      .groupBy('user.name')
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
      salesByUser: salesByUserQuery,
      monthlySales: monthlySalesQuery,
    };
  }
}