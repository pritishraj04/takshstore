import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const successStatuses = [
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'COMPLETED',
      'PUBLISHED',
    ] as any[];

    const [
      totalRevenueResult,
      pipelineItemsCount,
      completedItemsCount,
      totalCustomers,
      recentActivity,
    ] = await Promise.all([
      // Sum the amount of all Orders where payment was successful
      this.prisma.order.aggregate({
        where: { status: { in: successStatuses } },
        _sum: { totalAmount: true },
      }),
      // Count all items in the pipeline (Action Required)
      this.prisma.orderItem.count({
        where: {
          order: { status: { in: successStatuses } },
          status: { notIn: ['DELIVERED', 'PUBLISHED'] },
        },
      }),
      // Count all items that are completed
      this.prisma.orderItem.count({
        where: {
          status: { in: ['DELIVERED', 'PUBLISHED'] },
        },
      }),
      // Count all User records
      this.prisma.user.count(),
      // Fetch the 5 most recent Order creations
      this.prisma.order.findMany({
        where: {
          NOT: {
            AND: [
              { status: 'PENDING' },
              { totalAmount: 0 }
            ]
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            select: {
              quantity: true,
              product: { select: { title: true } },
            },
          },
        },
      }),
    ]);

    // Group paid orders by month for the last 6 months (Revenue Chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const paidOrders = await this.prisma.order.findMany({
      where: {
        status: { in: successStatuses },
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const monthlyRevenueMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      monthlyRevenueMap[monthStr] = 0;
    }

    paidOrders.forEach((order) => {
      const monthStr = order.createdAt.toLocaleString('default', {
        month: 'short',
      });
      if (monthlyRevenueMap[monthStr] !== undefined) {
        monthlyRevenueMap[monthStr] += order.totalAmount;
      }
    });

    const revenueChart = Object.entries(monthlyRevenueMap).map(
      ([name, total]) => ({
        name,
        total,
      }),
    );

    return {
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      pipelineItems: pipelineItemsCount,
      completedItems: completedItemsCount,
      totalCustomers,
      recentActivity,
      revenueChart,
    };
  }
}
