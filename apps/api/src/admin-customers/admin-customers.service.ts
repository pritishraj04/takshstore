import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserAccountStatus } from '@prisma/client';

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(searchQuery: string = '') {
    const whereClause: any = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : {};

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { orders: true }
        },
        orders: {
          where: { status: 'PAID' },
          select: { totalAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(u => {
        const lifetimeValue = u.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Exclude raw orders array and password from the response
        const { password, orders, ...safeUser } = u;
        return {
            ...safeUser,
            lifetimeValue,
            totalOrders: u._count.orders
        }
    });
  }

  async getCustomerById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
             items: {
                 include: { 
                     product: true, 
                     digitalInvite: true 
                 }
             }
          }
        }
      }
    });

    if (!user) throw new NotFoundException('Customer profile null');

    const paidOrders = user.orders.filter(o => o.status === 'PAID');
    const lifetimeValue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const { password, ...safeUser } = user;
    return { ...safeUser, lifetimeValue };
  }

  async updateCustomerStatus(id: string, status: UserAccountStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
          id: true,
          email: true,
          status: true
      }
    });
  }
}
