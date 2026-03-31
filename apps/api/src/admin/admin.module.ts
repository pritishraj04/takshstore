import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class AdminModule {}
