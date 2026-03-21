import { Controller, Get, Query, Put, Patch, Param, Body, UseGuards, Post } from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { ForceUpdateInviteDto, UpdateOrderStatusDto } from './dto/admin-orders.dto';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';

@Controller('admin/orders')
@UseGuards(AdminPermissionsGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @RequirePermission('orders', 'READ')
  async getAllOrders(
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminOrdersService.findAllOrders(search, status, Number(page) || 1, Number(limit) || 50);
  }

  @Patch(':id/status')
  @RequirePermission('orders', 'WRITE')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminOrdersService.updateOrderStatus(id, dto);
  }

  @Put(':id/force-update-invite')
  @RequirePermission('orders', 'WRITE')
  async forceUpdateInvite(@Param('id') id: string, @Body() dto: ForceUpdateInviteDto) {
    return this.adminOrdersService.forceUpdateInvite(id, dto);
  }

  @Post('manual')
  @RequirePermission('orders', 'WRITE')
  async createManualOrder(@Body() dto: import('./dto/admin-orders.dto').CreateManualOrderDto) {
    return this.adminOrdersService.createManualOrder(dto);
  }
}
