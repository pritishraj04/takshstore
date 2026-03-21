import { Module } from '@nestjs/common';
import { AdminCmsController, PublicCmsController } from './admin-cms.controller';
import { AdminCmsService } from './admin-cms.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminCmsController, PublicCmsController],
  providers: [AdminCmsService, Reflector],
})
export class AdminCmsModule {}
