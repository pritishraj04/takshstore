import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto, UpdateJournalDto } from './dto/journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Admin Methods ---
  
  async getAdminJournals() {
    return this.prisma.journal.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJournal(dto: CreateJournalDto) {
    const existing = await this.prisma.journal.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use.');

    return this.prisma.journal.create({
      data: dto,
    });
  }

  async updateJournal(id: string, dto: UpdateJournalDto) {
    if (dto.slug) {
        const existing = await this.prisma.journal.findUnique({ where: { slug: dto.slug } });
        if (existing && existing.id !== id) throw new ConflictException('Slug already in use.');
    }
    return this.prisma.journal.update({
      where: { id },
      data: dto,
    });
  }

  async deleteJournal(id: string) {
    return this.prisma.journal.delete({ where: { id } });
  }

  // --- Public Methods ---
  
  async getPublishedJournals(limit?: number) {
    return this.prisma.journal.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit || undefined,
    });
  }

  async getPublishedJournalBySlug(slug: string) {
    const journal = await this.prisma.journal.findFirst({
      where: { slug, isPublished: true },
    });
    if (!journal) throw new NotFoundException('Journal not found');
    return journal;
  }
}
