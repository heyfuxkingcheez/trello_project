// src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Patch,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RedisService } from '../configs/redis/redis.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return { message: '회원가입 성공', user };
  }

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.userService.findOne(req.user.email);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    const email = req.user.email;
    const updatedUser = await this.userService.updateUser(
      email,
      updateUserDto,
      imageFile,
    );
    return { message: '회원 정보가 업데이트되었습니다.', updatedUser };
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'), JwtAuthGuard)
  async deleteUser(@Request() req) {
    await this.userService.deleteUser(req.user.email);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
