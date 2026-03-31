import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';

@Controller('admin/inquiries')
@UseGuards(AdminPermissionsGuard)
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @RequirePermission('cms', 'READ') // Reusing CMS permission for inquiries
  async findAll() {
    return this.contactService.findAll();
  }

  @Patch(':id/read')
  @RequirePermission('cms', 'WRITE')
  async markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Delete(':id')
  @RequirePermission('cms', 'WRITE')
  async delete(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}
