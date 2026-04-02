  import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';

@Controller('admin/upload')
@UseGuards(AdminPermissionsGuard)
export class AdminUploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @RequirePermission('products', 'WRITE')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
    @Request() req: any,
  ) {
    // Admin sanctioned folder routing
    const allowedAdminFolders = ['catalog', 'journals', 'team', 'marketing'];
    const targetFolder = allowedAdminFolders.includes(folder) ? folder : 'catalog'; // Default to catalog if missing or invalid

    // Because of the guard, req.user now safely exists!
    const userId = req.user.sub || req.user.id;

    const url = await this.storageService.uploadFile(
      file,
      targetFolder,
      userId,
      true,
    );
    return { url };
  }

  @Delete()
  @RequirePermission('products', 'WRITE')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(@Body('url') url: string) {
    if (!url) return;
    
    // Only allow deleting files from our own domain to prevent SSRF/Abuse
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || '';
    if (publicDomain && !url.startsWith(publicDomain)) {
      return;
    }

    await this.storageService.deleteFile(url);
  }
}
