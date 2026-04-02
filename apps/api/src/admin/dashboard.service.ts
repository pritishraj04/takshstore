import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(timeframe: string) {
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = null;
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const [
      bestsellers, 
      couponStats, 
      recentReviews, 
      newCustomersCount,
      kpis,
      revenueChart,
      recentActivity
    ] = await Promise.all([
      this.getBestsellers(startDate, now),
      this.getCouponStats(startDate, now),
      this.getRecentReviews(startDate, now),
      this.getNewCustomersCount(startDate, now),
      this.getKPIs(startDate, now),
      this.getRevenueChart(startDate, now, timeframe),
      this.getRecentActivity(startDate, now),
    ]);

    return {
      bestsellers,
      coupons: couponStats,
      reviews: recentReviews,
      newCustomers: newCustomersCount,
      kpis,
      revenueChart,
      recentActivity,
    };
  }

  private async getBestsellers(startDate: Date | null, endDate: Date) {
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
          status: { notIn: ['FAILED', 'PENDING'] },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { title: true, price: true, imageUrl: true },
        });
        return {
          ...product,
          salesCount: item._sum.quantity,
        };
      }),
    );

    return productDetails;
  }

  private async getCouponStats(startDate: Date | null, endDate: Date) {
    const [activeCount, inactiveCount, totalUsage] = await Promise.all([
      this.prisma.coupon.count({ where: { isActive: true } }),
      this.prisma.coupon.count({ where: { isActive: false } }),
      this.prisma.order.count({
        where: {
          couponCode: { not: null },
          createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
          status: { notIn: ['FAILED', 'PENDING'] },
        },
      }),
    ]);

    return {
      active: activeCount,
      inactive: inactiveCount,
      totalUsage,
    };
  }

  private async getRecentReviews(startDate: Date | null, endDate: Date) {
    return this.prisma.review.findMany({
      where: {
        createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        product: { select: { title: true } },
      },
    });
  }

  private async getNewCustomersCount(startDate: Date | null, endDate: Date) {
    return this.prisma.user.count({
      where: {
        createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
      },
    });
  }

  private async getKPIs(startDate: Date | null, endDate: Date) {
    const successStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'PUBLISHED'] as any;
    
    const [totalRevenueResult, pipelineItems, completedItems, totalCustomers] = await Promise.all([
      this.prisma.order.aggregate({
        where: { 
          status: { in: successStatuses },
          createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.orderItem.count({
        where: {
          order: { 
            status: { in: successStatuses },
            createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
          },
          status: { notIn: ['DELIVERED', 'PUBLISHED'] },
        },
      }),
      this.prisma.orderItem.count({
        where: {
          order: {
            createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
          },
          status: { in: ['DELIVERED', 'PUBLISHED'] },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
        }
      }),
    ]);

    return {
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      pipelineItems,
      completedItems,
      totalCustomers,
    };
  }

  private async getRecentActivity(startDate: Date | null, endDate: Date) {
    return this.prisma.order.findMany({
      where: {
        createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate },
        NOT: {
          AND: [
            { status: 'PENDING' },
            { totalAmount: 0 }
          ]
        }
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    });
  }

  private async getRevenueChart(startDate: Date | null, endDate: Date, timeframe: string) {
    const successStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'PUBLISHED'] as any;
    
    // Default to the last available if 'all'
    const finalStartDate = startDate || new Date(new Date().getFullYear(), 0, 1);
    
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: successStatuses },
        createdAt: { gte: finalStartDate, lte: endDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Grouping logic based on timeframe
    const map: Record<string, number> = {};
    
    if (timeframe === '1d') {
      // By Hour
      for (let i = 0; i < 24; i++) {
        const h = new Date(endDate.getTime() - i * 3600000);
        map[h.getHours() + ':00'] = 0;
      }
      orders.forEach(o => {
        const key = o.createdAt.getHours() + ':00';
        if (map[key] !== undefined) map[key] += o.totalAmount;
      });
    } else if (timeframe === '1w' || timeframe === '1m') {
      // By Day
      const days = timeframe === '1w' ? 7 : 30;
      for (let i = 0; i < days; i++) {
        const d = new Date(endDate.getTime() - i * 86400000);
        const key = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        map[key] = 0;
      }
      orders.forEach(o => {
        const key = o.createdAt.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        if (map[key] !== undefined) map[key] += o.totalAmount;
      });
    } else {
      // By Month
      const months = timeframe === '6m' ? 6 : timeframe === '1y' ? 12 : 24;
      for (let i = 0; i < months; i++) {
        const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const key = d.toLocaleDateString('default', { month: 'short', year: timeframe === 'all' ? '2-digit' : undefined });
        map[key] = 0;
      }
      orders.forEach(o => {
        const key = o.createdAt.toLocaleDateString('default', { month: 'short', year: timeframe === 'all' ? '2-digit' : undefined });
        if (map[key] !== undefined) map[key] += o.totalAmount;
      });
    }

    return Object.entries(map).reverse().map(([name, total]) => ({ name, total }));
  }
}
