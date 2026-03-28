import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async processOrderSuccess(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        user: true,
        items: { include: { digitalInvite: true, product: true } },
      },
    });

    for (const item of order.items) {
      if (item.digitalInvite && item.digitalInvite.status === 'DRAFT') {
        const inviteData = item.digitalInvite.inviteData as any;
        let latestDate: Date | null = null;
        if (
          inviteData?.celebrations &&
          Array.isArray(inviteData.celebrations)
        ) {
          const times = inviteData.celebrations
            .map((c: any) => new Date(c.date).getTime())
            .filter((t: number) => !isNaN(t));
          if (times.length > 0) {
            latestDate = new Date(Math.max(...times));
          }
        }

        const brideName = inviteData?.couple?.bride?.name || null;
        const groomName = inviteData?.couple?.groom?.name || null;

        await this.prisma.digitalInvite.update({
          where: { id: item.digitalInvite.id },
          data: {
            status: 'DEVELOPMENT',
            originalEventDate: latestDate,
            originalBrideName: brideName,
            originalGroomName: groomName,
          },
        });

        // Trigger Digital Access Mail
        const customizerToken = this.jwtService.sign(
          { id: item.digitalInvite.id, type: 'CUSTOMIZER_ACCESS' },
          { expiresIn: '90d', secret: process.env.JWT_SECRET || 'dev_secret' },
        );
        const customizerLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customizer/${item.digitalInvite.slug}?token=${customizerToken}`;

        await this.mailService.sendDigitalInviteAccess(
          order.user.email,
          customizerLink,
        );
      } else if (!item.digitalInvite) {
        // Assuming Physical Canvas Print
        const breakdownText = `Product: ${item.product.title} (x${item.quantity}) - ₹${item.priceAtPurchase * item.quantity}`;
        await this.mailService.sendCanvasReceipt(
          order.user.email,
          breakdownText,
        );
      }
    }
  }
}
