import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Body,
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
}
