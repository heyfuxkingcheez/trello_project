// src/users/users.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CloudflareService } from '../configs/cloudflare/cloudflare.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudflareService: CloudflareService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, username, comment } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
      comment,
    });
    return this.userRepository.save(newUser);
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateUser(
    email: string,
    updateUserDto: UpdateUserDto,
    imageFile?: Express.Multer.File,
  ): Promise<User> {
    const { currentPassword, newPassword, username, imageUrl, comment } =
      updateUserDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new ConflictException('사용자를 찾을 수 없습니다.');
    }

    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      throw new ConflictException('현재 비밀번호가 일치하지 않습니다.');
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }
    if (username) {
      user.username = username;
    }

    if (comment) {
      user.comment = comment;
    }
    // 이미지 파일이 제공된 경우
    if (imageFile) {
      // 기존 이미지가 있으면 삭제
      if (user.imageUrl) {
        await this.cloudflareService.deleteImage(user.imageUrl);
      }

      // 새 이미지 업로드
      const uploadedImageUrl = await this.cloudflareService.uploadImage(
        imageFile.buffer,
        imageFile.originalname,
      );
      user.imageUrl = uploadedImageUrl;
    } else if (imageUrl) {
      // 이미지 URL이 직접 제공된 경우
      user.imageUrl = imageUrl;
    }

    return this.userRepository.save(user);
  }
}
