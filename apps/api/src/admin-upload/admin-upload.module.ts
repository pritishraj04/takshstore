import { Module } from '@nestjs/common';
import { AdminUploadService } from './admin-upload.service';
import { AdminUploadController } from './admin-upload.controller';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  providers: [AdminUploadService],
  controllers: [AdminUploadController],
  exports: [AdminUploadService],
})
export class AdminUploadModule {}
