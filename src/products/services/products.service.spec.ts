import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      name: 'Test Product',
      description: 'Test Description',
    };

    const mockProduct = {
      id: 1,
      ...createProductDto,
    };

    it('should successfully create a product', async () => {
      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('findAll', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Description 1' },
      { id: 2, name: 'Product 2', description: 'Description 2' },
    ];

    it('should return an array of products', async () => {
      mockRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
    };

    it('should return a product if found', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return undefined if product is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(undefined);

      const result = await service.findOne(999);

      expect(result).toBeUndefined();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('update', () => {
    const updateProductDto = {
      name: 'Updated Product',
      description: 'Updated Description',
    };

    const mockProduct = {
      id: 1,
      ...updateProductDto,
    };

    it('should successfully update a product', async () => {
      mockRepository.preload.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.update(1, updateProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateProductDto,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockRepository.preload.mockResolvedValue(undefined);

      await expect(service.update(999, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
    };

    it('should successfully remove a product', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockProduct);
      mockRepository.remove.mockResolvedValue(mockProduct);

      await service.remove(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(undefined);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});