// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { RedisService } from '../configs/redis/redis.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../configs/nodemailer/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException(
        '존재하지 않는 회원이거나 비밀번호가 틀립니다.',
      );
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.redisService.setRefreshToken(user.email, refreshToken);

    return {
      message: '로그인 완료',
      access_token: accessToken,
    };
  }

  generateAccessToken(user: any) {
    const payload = { email: user.email, sub: user.id };

    return this.jwtService.sign(payload);
  }

  async sendVerificationCode(email: string): Promise<void> {
    // const code = Math.random().toString(36).substring(2, 8);
    const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    await this.redisService.setVerificationCode(email, code.toString());
    await this.emailService.sendVerificationEmail(email, code.toString());
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const storedCode = await this.redisService.getVerificationCode(email);
    return storedCode === code;
  }
}
