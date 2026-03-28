import { Module } from '@nestjs/common';
import { AdminUploadController } from './admin-upload.controller';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AdminAuthModule, StorageModule],
  providers: [],
  controllers: [AdminUploadController],
  exports: [],
})
export class AdminUploadModule {}
