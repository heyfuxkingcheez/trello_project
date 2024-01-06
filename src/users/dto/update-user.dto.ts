// src/users/dto/update-user.dto.ts
import { IsString, IsOptional, Length, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsOptional()
  @Length(6, 20)
  newPassword?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
