import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminUploadService } from './admin-upload.service';
import {
  AdminPermissionsGuard,
  RequirePermission,
} from '../admin-auth/guards/rbac.guard';

@Controller('admin/upload')
@UseGuards(AdminPermissionsGuard)
export class AdminUploadController {
  constructor(private readonly adminUploadService: AdminUploadService) {}

  @Post()
  @RequirePermission('products', 'WRITE')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.adminUploadService.uploadImage(file);
    return { url };
  }
}
