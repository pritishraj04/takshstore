import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';
import { CreateProductDto, UpdateProductDto } from './dto/admin-products.dto';

@Controller('admin/products')
@UseGuards(AdminPermissionsGuard)
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  @Get()
  @RequirePermission('products', 'READ')
  async getProducts(@Query('category') category?: 'CANVAS' | 'DIGITAL') {
    return this.service.getProducts(category);
  }

  @Post()
  @RequirePermission('products', 'WRITE')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  @Put(':id')
  @RequirePermission('products', 'WRITE')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.updateProduct(id, dto);
  }

  @Patch(':id/toggle-status')
  @RequirePermission('products', 'WRITE')
  async toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Get('check-template/:slug')
  @RequirePermission('products', 'READ')
  async checkTemplate(@Param('slug') slug: string) {
    return this.service.checkTemplate(slug);
  }
}
