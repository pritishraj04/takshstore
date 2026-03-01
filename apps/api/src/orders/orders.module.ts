import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if required for guards
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [PrismaModule, AuthModule, PaymentsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
