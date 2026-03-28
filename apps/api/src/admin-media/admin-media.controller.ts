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
  @RequirePermission('media', 'READ')
  async getAllMedia() {
    return this.adminMediaService.getAllMediaFiles();
  }

  @Delete(':mediaId')
  @RequirePermission('media', 'WRITE')
  async deleteMedia(@Param('mediaId') mediaId: string) {
    return this.adminMediaService.deleteMedia(mediaId);
  }
}
