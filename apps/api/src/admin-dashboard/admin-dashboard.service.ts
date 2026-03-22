import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalRevenueResult, activeOrdersCount, totalCustomers, recentActivity] = await Promise.all([
      // Sum the amount of all Orders where status === 'PAID'
      this.prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      // Count all Orders where status === 'PENDING' or 'PAID' (not shipped/delivered)
      this.prisma.order.count({
        where: {
          status: { in: ['PENDING', 'PAID', 'PROCESSING'] },
        },
      }),
      // Count all User records
      this.prisma.user.count(),
      // Fetch the 5 most recent Order creations
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { product: { select: { title: true } } } },
        },
      }),
    ]);

    // Group paid orders by month for the last 6 months (Revenue Chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const paidOrders = await this.prisma.order.findMany({
      where: {
        status: 'PAID',
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
      const monthStr = order.createdAt.toLocaleString('default', { month: 'short' });
      if (monthlyRevenueMap[monthStr] !== undefined) {
        monthlyRevenueMap[monthStr] += order.totalAmount;
      }
    });

    const revenueChart = Object.entries(monthlyRevenueMap).map(([name, total]) => ({
      name,
      total,
    }));

    return {
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      activeOrders: activeOrdersCount,
      totalCustomers,
      recentActivity,
      revenueChart,
    };
  }
}
