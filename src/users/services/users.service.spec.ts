import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import * as bcrypt from 'bcryptjs';

// Mock de bcrypt para evitar hashing real en tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeAdminUser', () => {
    it('should create admin user if no users exist', async () => {
      mockUserRepository.count.mockResolvedValue(0);
      mockUserRepository.create.mockReturnValue({ name: 'Administrator', email: 'admin@example.com' });
      mockUserRepository.save.mockResolvedValue({ id: 1, name: 'Administrator', email: 'admin@example.com' });

      // Llamamos al método privado usando cualquier truco para accederlo (esto es para el test)
      await (service as any).initializeAdminUser();

      expect(mockUserRepository.count).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'hashedPassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should not create admin user if users exist', async () => {
      mockUserRepository.count.mockResolvedValue(1);

      await (service as any).initializeAdminUser();

      expect(mockUserRepository.count).toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 1,
        ...createUserDto,
        password: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(null); // No existe el usuario
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UserResponseDto);
      
      // Importante: comprueba sólo las propiedades expuestas, no el objeto completo
      expect(result.id).toEqual(1);
      expect(result.name).toEqual(createUserDto.name);
      expect(result.email).toEqual(createUserDto.email);
      // No debemos verificar password porque no debe estar expuesto
      expect((result as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, name: 'User 1', email: 'user1@example.com', password: 'hash1' },
        { id: 2, name: 'User 2', email: 'user2@example.com', password: 'hash2' },
      ];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result.length).toEqual(2);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[0].id).toEqual(1);
      expect(result[0].name).toEqual('User 1');
      expect(result[0].email).toEqual('user1@example.com');
      // Verificamos que password NO esté presente
      expect((result[0] as any).password).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com', password: 'hash' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toEqual(1);
      expect(result.name).toEqual('Test User');
      expect(result.email).toEqual('test@example.com');
      // Verificamos que password NO esté presente
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com', password: 'hash' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(user); // Aquí sí debería incluir password, ya que es el objeto User completo
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should successfully update a user', async () => {
      const updateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      const existingUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(existingUser); // Primera llamada para verificar existencia
      mockUserRepository.findOne.mockResolvedValueOnce(null); // Segunda llamada para verificar email duplicado
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UserResponseDto);
      
      // Verifica solo las propiedades expuestas, no el objeto completo
      expect(result.id).toEqual(1);
      expect(result.name).toEqual(updateUserDto.name);
      expect(result.email).toEqual(updateUserDto.email);
      // No debemos verificar password porque no debe estar expuesto
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated User' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new email already exists', async () => {
      const updateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      // Primera llamada: el usuario 1 existe
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      // Segunda llamada: el email ya existe para otro usuario
      mockUserRepository.findOne.mockResolvedValueOnce({ id: 2, email: 'existing@example.com' });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should successfully remove a user', async () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      await service.remove(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});