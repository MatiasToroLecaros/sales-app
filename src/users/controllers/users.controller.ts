// backend/src/users/users.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Patch, 
    Delete, 
    UseGuards,
    ParseIntPipe,
    UseInterceptors,
    ClassSerializerInterceptor
  } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
  import { UsersService } from '../services/users.service';
  import { CreateUserDto } from '../dto/create-user.dto';
  import { UpdateUserDto } from '../dto/update-user.dto';
  import { UserResponseDto } from '../dto/user-response.dto';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  
  @ApiTags('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ 
      status: 201, 
      description: 'User created successfully',
      type: UserResponseDto 
    })
    @ApiResponse({ 
      status: 409, 
      description: 'Email already in use' 
    })
    create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
      return this.usersService.create(createUserDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ 
      status: 200, 
      description: 'Returns all users',
      type: [UserResponseDto] 
    })
    findAll(): Promise<UserResponseDto[]> {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ 
      status: 200, 
      description: 'Returns the user',
      type: UserResponseDto 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
      return this.usersService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ 
      status: 200, 
      description: 'User updated successfully',
      type: UserResponseDto 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
    @ApiResponse({ 
      status: 409, 
      description: 'Email already in use' 
    })
    update(
      @Param('id', ParseIntPipe) id: number, 
      @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
      return this.usersService.update(id, updateUserDto);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ 
      status: 200, 
      description: 'User deleted successfully' 
    })
    @ApiResponse({ 
      status: 404, 
      description: 'User not found' 
    })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
      await this.usersService.remove(id);
      return { message: 'User deleted successfully' };
    }
  }