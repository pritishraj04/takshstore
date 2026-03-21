import { Module } from '@nestjs/common';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminCustomersService } from './admin-customers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminCustomersController],
  providers: [AdminCustomersService],
})
export class AdminCustomersModule {}
