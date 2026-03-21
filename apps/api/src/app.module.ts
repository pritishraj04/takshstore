import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { DigitalInvitesModule } from './digital-invites/digital-invites.module';
import { StorageModule } from './storage/storage.module';
import { CouponsModule } from './coupons/coupons.module';
import { ArticlesModule } from './articles/articles.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminOrdersModule } from './admin-orders/admin-orders.module';
import { AdminMediaModule } from './admin-media/admin-media.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AdminCmsModule } from './admin-cms/admin-cms.module';
import { AdminCustomersModule } from './admin-customers/admin-customers.module';
import { AdminProductsModule } from './admin-products/admin-products.module';
import { AdminCouponsModule } from './admin-coupons/admin-coupons.module';

@Module({
  imports: [AuthModule, PrismaModule, ProductsModule, OrdersModule, PaymentsModule, DigitalInvitesModule, StorageModule, CouponsModule, ArticlesModule, AdminAuthModule, AdminOrdersModule, AdminMediaModule, AdminUsersModule, AdminCmsModule, AdminCustomersModule, AdminProductsModule, AdminCouponsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
