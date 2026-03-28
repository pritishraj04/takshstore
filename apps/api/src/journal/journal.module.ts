import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JournalController } from './journal.controller';
import { AdminJournalController } from './admin-journal.controller';
import { JournalService } from './journal.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PrismaModule, AdminAuthModule, JwtModule.register({ secret: process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod' })],
  controllers: [JournalController, AdminJournalController],
  providers: [JournalService, Reflector],
})
export class JournalModule {}


