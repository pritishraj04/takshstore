import { Controller, Post, Delete, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Using existing auth guard if needed. Can remove if endpoints should be public to build drafts.

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder: string
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const targetFolder = folder || 'uploads';
        const fileUrl = await this.storageService.uploadFile(file, targetFolder);

        return {
            success: true,
            url: fileUrl,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete')
    async deleteFile(@Body('fileUrl') fileUrl: string) {
        if (!fileUrl) {
            throw new BadRequestException('fileUrl is required');
        }

        await this.storageService.deleteFile(fileUrl);

        return {
            success: true,
            message: 'File successfully deleted',
        };
    }
}
