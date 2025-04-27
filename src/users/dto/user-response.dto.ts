// backend/src/users/dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ description: 'User ID' })
  id: number;

  @Expose()
  @ApiProperty({ description: 'User name' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'User email' })
  email: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}