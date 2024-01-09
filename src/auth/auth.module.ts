// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RedisModule } from '../configs/redis/redis.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from '../configs/nodemailer/email.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { CardsModule } from 'src/cards/cards.module';
import { BoardsModule } from 'src/boards/boards.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RedisModule,
    CardsModule,
    BoardsModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    LocalAuthGuard,
    EmailService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
