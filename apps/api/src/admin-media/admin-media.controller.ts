import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminMediaService } from './admin-media.service';
import {
  AdminPermissionsGuard,
  RequirePermission,
} from '../admin-auth/guards/rbac.guard';

@Controller('admin/media')
@UseGuards(AdminPermissionsGuard)
export class AdminMediaController {
  constructor(private readonly adminMediaService: AdminMediaService) {}

  @Get()
  @RequirePermission('orders', 'READ')
  async getAllMedia() {
    return this.adminMediaService.getAllMediaFiles();
  }

  @Delete(':inviteId')
  @RequirePermission('orders', 'WRITE')
  async deleteMedia(
    @Param('inviteId') inviteId: string,
    @Query('type') type: 'IMAGE' | 'AUDIO',
  ) {
    return this.adminMediaService.deleteMedia(inviteId, type);
  }
}
