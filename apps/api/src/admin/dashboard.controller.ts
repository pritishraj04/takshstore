import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminPermissionsGuard } from '../admin-auth/guards/rbac.guard';

@Controller('admin/dashboard')
@UseGuards(AdminPermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardStats(
    @Request() req: any,
    @Query('timeframe') timeframe: string = '1d',
  ) {
    const admin = req.adminUser;
    const stats: any = await this.dashboardService.getDashboardStats(timeframe);

    const response: any = {
      bestsellers: stats.bestsellers,
      kpis: stats.kpis,
      revenueChart: stats.revenueChart,
      recentActivity: stats.recentActivity,
    };

    // Backend RBAC: Check if admin has access to view coupons
    const canViewCoupons = admin.isSuper || (admin.permissions && admin.permissions.coupons !== 'NONE');
    if (canViewCoupons) {
      response.coupons = stats.coupons;
    }

    const canViewCustomers = admin.isSuper || (admin.permissions && admin.permissions.customers !== 'NONE');
    if (canViewCustomers) {
      response.newCustomers = stats.newCustomers;
    }

    const canViewReviews = admin.isSuper || (admin.permissions && admin.permissions.reviews !== 'NONE');
    if (canViewReviews) {
      response.reviews = stats.reviews;
    }

    return response;
  }
}
