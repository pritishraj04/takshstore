import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, Reflector],
  exports: [AdminAuthService, JwtModule],
})
export class AdminAuthModule {}
