import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  Post,
} from '@nestjs/common';
import { AdminCustomersService } from './admin-customers.service';
import {
  AdminPermissionsGuard,
  RequirePermission,
} from '../admin-auth/guards/rbac.guard';
import { UpdateCustomerStatusDto } from './dto/admin-customers.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('admin/customers')
@UseGuards(AdminPermissionsGuard)
export class AdminCustomersController {
  constructor(private readonly service: AdminCustomersService) {}

  @Get()
  @RequirePermission('customers', 'READ')
  async getCustomers(@Query('search') search: string) {
    return this.service.getCustomers(search);
  }

  @Get(':id')
  @RequirePermission('customers', 'READ')
  async getCustomerById(@Param('id') id: string) {
    return this.service.getCustomerById(id);
  }

  @Patch(':id/status')
  @RequirePermission('customers', 'WRITE')
  async updateCustomerStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerStatusDto,
  ) {
    return this.service.updateCustomerStatus(id, dto.status);
  }

  @Post()
  @RequirePermission('customers', 'WRITE')
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.service.createCustomer(createCustomerDto);
  }
}
