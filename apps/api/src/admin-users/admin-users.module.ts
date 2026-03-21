import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, Reflector],
})
export class AdminUsersModule {}
