import { Module } from '@nestjs/common';
import { AdminMediaController } from './admin-media.controller';
import { AdminMediaService } from './admin-media.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, StorageModule, AdminAuthModule],
  controllers: [AdminMediaController],
  providers: [AdminMediaService, Reflector],
})
export class AdminMediaModule {}
