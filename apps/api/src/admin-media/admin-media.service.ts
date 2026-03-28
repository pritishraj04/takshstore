import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AdminMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getAllMediaFiles() {
    // Primary Source: Use the newly established Media table for structured global visibility
    const media = await this.prisma.media.findMany({
      include: {
        user: { select: { name: true, email: true } },
        admin: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return the consolidated list
    return media.map((item) => ({
      id: item.id,
      url: item.url,
      key: item.key,
      type: item.type,
      uploadedAt: item.createdAt,
      user: item.user || item.admin || null,
      uploaderType: item.adminId ? 'ADMIN' : item.userId ? 'USER' : 'SYSTEM',
    }));
  }

  async deleteMedia(mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) throw new NotFoundException('Media asset not found');

    // 1. Physically terminate the file block via explicit AWS S3 DeleteObjectCommand
    try {
      await this.storage.deleteFile(media.url);
    } catch (e) {
      // Catch exceptions silently here in case S3 was already nuked physically. We still want to strip the DB!
      console.error('S3 Delete Overwrite Mismatch', e);
    }

    // 2. Wipe record from the database
    await this.prisma.media.delete({
      where: { id: mediaId },
    });

    return { message: 'Asset permanently removed from S3 and database' };
  }
}
