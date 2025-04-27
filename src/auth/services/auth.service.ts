import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Create user through users service
    const createUserDto: CreateUserDto = {
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    };
    
    await this.usersService.create(createUserDto);
    
    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(loginDto.email);
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Generate JWT token
      const payload = { email: user.email, sub: user.id };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}