// backend/src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Initialize admin user if no users exist
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const adminUser = this.userRepository.create({
        name: 'Administrator',
        email: 'admin@example.com',
        password: adminPassword,
      });
      await this.userRepository.save(adminUser);
      console.log('Admin user created successfully');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({ 
      where: { email: createUserDto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    const savedUser = await this.userRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map(user => new UserResponseDto(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // First check if user exists
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // If email is being updated, check for duplicates
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ 
        where: { email: updateUserDto.email } 
      });
      
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }
    
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Update user directly
    Object.assign(user, updateUserDto);
    
    // Save the updated user
    const savedUser = await this.userRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await this.userRepository.remove(user);
  }
}