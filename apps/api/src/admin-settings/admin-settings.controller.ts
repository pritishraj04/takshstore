import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import {
  AdminPermissionsGuard,
  RequirePermission,
} from '../admin-auth/guards/rbac.guard';

@Controller('admin/settings')
@UseGuards(AdminPermissionsGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  @RequirePermission('cms', 'READ')
  async getSettings() {
    return this.settingsService.getAllSettings();
  }

  @Put()
  @RequirePermission('cms', 'WRITE')
  async updateSettings(@Body() data: Record<string, string>) {
    return this.settingsService.updateSettings(data);
  }
}
