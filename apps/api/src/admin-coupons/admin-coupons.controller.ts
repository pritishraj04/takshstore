import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminCouponsService } from './admin-coupons.service';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';
import { CreateCouponDto, UpdateCouponDto } from './dto/admin-coupons.dto';

@Controller('admin/coupons')
@UseGuards(AdminPermissionsGuard)
export class AdminCouponsController {
  constructor(private readonly service: AdminCouponsService) {}

  @Get()
  @RequirePermission('coupons', 'WRITE') // Also readable
  async getCoupons() {
    return this.service.getCoupons();
  }

  @Post()
  @RequirePermission('coupons', 'WRITE')
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.service.createCoupon(dto);
  }

  @Put(':id')
  @RequirePermission('coupons', 'WRITE')
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.service.updateCoupon(id, dto);
  }

  @Patch(':id/toggle')
  @RequirePermission('coupons', 'WRITE')
  async toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }
}
