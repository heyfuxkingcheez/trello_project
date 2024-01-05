// src/users/dto/create-user.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsNumber()
  @IsOptional()
  imageUrl?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
