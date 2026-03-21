import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, AdminAuthModule, PaymentsModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService, Reflector],
})
export class AdminOrdersModule {}
