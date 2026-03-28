import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewService } from './review.service';
import { ReviewController, ProductReviewController } from './review.controller';
import { AdminReviewController } from './admin-review.controller';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    AdminAuthModule,
    AuthModule,
    JwtModule.register({
      secret:
        process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
    }),
  ],
  controllers: [
    ReviewController,
    ProductReviewController,
    AdminReviewController,
  ],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
