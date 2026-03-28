import { Module } from '@nestjs/common';
import { DigitalInvitesService } from './digital-invites.service';
import { DigitalInvitesController } from './digital-invites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DigitalInvitesController],
  providers: [DigitalInvitesService],
})
export class DigitalInvitesModule {}
