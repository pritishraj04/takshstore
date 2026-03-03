import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { DigitalInvitesModule } from './digital-invites/digital-invites.module';

@Module({
  imports: [AuthModule, PrismaModule, ProductsModule, OrdersModule, PaymentsModule, DigitalInvitesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
