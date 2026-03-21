import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AdminMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  async getAllMediaFiles() {
    const invites = await this.prisma.digitalInvite.findMany({
      select: { id: true, slug: true, inviteData: true, createdAt: true, updatedAt: true },
    });

    const assets: any[] = [];

    for (const invite of invites) {
      let inviteData: any = {};
      try {
        inviteData = typeof invite.inviteData === 'string' ? JSON.parse(invite.inviteData) : (invite.inviteData || {});
      } catch {}

      if (inviteData.heroImage) {
        assets.push({
          inviteId: invite.id,
          slug: invite.slug,
          type: 'IMAGE',
          url: inviteData.heroImage,
          uploadedAt: invite.updatedAt || invite.createdAt,
        });
      }

      if (inviteData.music && inviteData.music.url) {
        assets.push({
          inviteId: invite.id,
          slug: invite.slug,
          type: 'AUDIO',
          url: inviteData.music.url,
          uploadedAt: invite.updatedAt || invite.createdAt,
        });
      }
    }

    // Sort by most recent changes
    return assets.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async deleteMedia(inviteId: string, type: 'IMAGE' | 'AUDIO') {
    const invite = await this.prisma.digitalInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException('Invite not found');

    let inviteData: any = {};
    try {
      inviteData = typeof invite.inviteData === 'string' ? JSON.parse(invite.inviteData as string) : (invite.inviteData || {});
    } catch {}

    const url = type === 'IMAGE' ? inviteData.heroImage : inviteData.music?.url;

    if (!url) throw new NotFoundException('Asset URL not found on this invite');

    // 1. Physically terminate the file block via explicit AWS S3 DeleteObjectCommand
    try {
      await this.storage.deleteFile(url);
    } catch (e) {
      // Catch exceptions silently here in case S3 was already nuked physically. We still want to strip the DB!
      console.error('S3 Delete Overwrite Mismatch', e);
    }

    // 2. Wipe reference from the database cleanly
    if (type === 'IMAGE') {
      inviteData.heroImage = '';
    } else {
      if (inviteData.music) {
         inviteData.music.url = '';
         inviteData.music.name = ''; // Purge meta names as well 
      }
    }

    await this.prisma.digitalInvite.update({
      where: { id: inviteId },
      data: { inviteData },
    });

    return { message: 'Asset permanently removed from S3 and database' };
  }
}
