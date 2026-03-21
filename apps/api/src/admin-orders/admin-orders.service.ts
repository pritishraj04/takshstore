import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { ForceUpdateInviteDto, UpdateOrderStatusDto } from './dto/admin-orders.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class AdminOrdersService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly paymentsService: PaymentsService
  ) {}

  async createManualOrder(dto: import('./dto/admin-orders.dto').CreateManualOrderDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Customer not found.');

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found.');

    // 1. Create the Order
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        status: dto.paymentStatus,
        totalAmount: dto.customPrice,
        shippingAddress: dto.shippingAddress || null,
        isManual: true,
        items: {
          create: [{
            productId: product.id,
            quantity: 1,
            priceAtPurchase: dto.customPrice,
          }]
        }
      },
      include: { items: true }
    });

    const orderItem = order.items[0];

    // 2. Attach DigitalInvite if it's DIGITAL
    if (dto.orderType === 'DIGITAL') {
      await this.prisma.digitalInvite.create({
        data: {
          orderItemId: orderItem.id,
          inviteData: {},
          status: 'DRAFT'
        }
      });
    }

    // 3. Trigger receipt generation logic if PAID and requested
    if (dto.paymentStatus === 'PAID' && dto.sendEmailReceipt) {
      // The payments API requires order ID execution explicitly mapping items naturally
      await this.paymentsService.processOrderSuccess(order.id);
    }

    return order;
  }

  async findAllOrders(search: string = '', status: string = '', page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'All') {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { type: true, title: true } },
              digitalInvite: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, limit };
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
    return order;
  }

  async forceUpdateInvite(orderId: string, dto: ForceUpdateInviteDto) {
    // Locate the specific order and its invite
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { digitalInvite: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    let targetInvite: any = null;

    for (const item of order.items) {
      if (item.digitalInvite) {
        targetInvite = item.digitalInvite;
        break;
      }
    }

    if (!targetInvite) {
      throw new NotFoundException('No Digital Invite found for this order. Only digital orders have invites.');
    }

    // Force update the JSON payload specifically bypassing regular logic locks
    let inviteData: any = {};
    try {
      inviteData = typeof targetInvite.inviteData === 'string' ? JSON.parse(targetInvite.inviteData as string) : targetInvite.inviteData || {};
    } catch {}

    if (dto.brideName) inviteData.brideName = dto.brideName;
    if (dto.groomName) inviteData.groomName = dto.groomName;
    if (dto.eventDate) inviteData.eventDate = dto.eventDate;

    // Save directly to the DigitalInvite record circumventing public horizons
    const updated = await this.prisma.digitalInvite.update({
      where: { id: targetInvite.id },
      data: {
        originalBrideName: dto.brideName || targetInvite.originalBrideName,
        originalGroomName: dto.groomName || targetInvite.originalGroomName,
        originalEventDate: dto.eventDate ? new Date(dto.eventDate) : targetInvite.originalEventDate,
        inviteData,
      },
    });

    return updated;
  }
}
