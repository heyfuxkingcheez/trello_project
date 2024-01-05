// src/auth/dto/login-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'yourpassword', description: '사용자 비밀번호' })
  password: string;
}
