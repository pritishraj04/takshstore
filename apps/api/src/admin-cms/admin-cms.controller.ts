import { Controller, Get, Put, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AdminCmsService } from './admin-cms.service';
import { CreateFaqDto, UpdateCmsDocumentDto, UpdateFaqDto } from './dto/admin-cms.dto';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';

// Public generic endpoints allowing the Next.js frontend to statically build out the HTML outputs
@Controller('cms')
export class PublicCmsController {
  constructor(private readonly cmsService: AdminCmsService) {}

  @Get('content/:key')
  async getCmsContent(@Param('key') key: string) {
      return this.cmsService.getCmsContent(key);
  }

  @Get('documents/:slug')
  async getDocument(@Param('slug') slug: string) {
      return this.cmsService.getDocument(slug);
  }

  @Get('faqs')
  async getFaqs() {
      return this.cmsService.getFaqs(true);
  }
}

// Protected internal Admin mutation routers
@Controller('admin/cms')
@UseGuards(AdminPermissionsGuard)
export class AdminCmsController {
  constructor(private readonly cmsService: AdminCmsService) {}

  @Get('documents')
  @RequirePermission('cms', 'READ')
  async getDocuments() {
    return this.cmsService.getDocuments();
  }

  @Patch('content/:key')
  @RequirePermission('cms', 'WRITE')
  async updateCmsContent(@Param('key') key: string, @Body('content') content: string) {
    return this.cmsService.upsertCmsContent(key, content);
  }

  @Put('documents/:slug')
  @RequirePermission('cms', 'WRITE')
  async updateDocument(@Param('slug') slug: string, @Body() dto: UpdateCmsDocumentDto, @Req() req: any) {
    return this.cmsService.updateDocument(slug, dto, req.user?.id);
  }

  @Get('faqs')
  @RequirePermission('cms', 'READ')
  async getFaqs() {
    return this.cmsService.getFaqs(false);
  }

  @Post('faqs')
  @RequirePermission('cms', 'WRITE')
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.cmsService.createFaq(dto);
  }

  @Patch('faqs/reorder')
  @RequirePermission('cms', 'WRITE')
  async updateFaqOrders(@Body('orders') orders: { id: string, displayOrder: number }[]) {
    return this.cmsService.updateFaqOrders(orders);
  }

  @Put('faqs/:id')
  @RequirePermission('cms', 'WRITE')
  async updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.cmsService.updateFaq(id, dto);
  }

  @Delete('faqs/:id')
  @RequirePermission('cms', 'WRITE')
  async deleteFaq(@Param('id') id: string) {
    return this.cmsService.deleteFaq(id);
  }
}
