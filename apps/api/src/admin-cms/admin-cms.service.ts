import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, UpdateCmsDocumentDto, UpdateFaqDto } from './dto/admin-cms.dto';

@Injectable()
export class AdminCmsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- CMS Public & Private Accessors ---
  
  async getCmsContent(key: string) {
    const data = await this.prisma.cmsContent.findUnique({
      where: { key: key.toUpperCase() },
    });
    return data || { key: key.toUpperCase(), content: '' };
  }

  async upsertCmsContent(key: string, content: string) {
    const formattedKey = key.toUpperCase();
    return this.prisma.cmsContent.upsert({
      where: { key: formattedKey },
      update: { content },
      create: { key: formattedKey, content },
    });
  }
  async getDocuments() {
    return this.prisma.cmsDocument.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getDocument(slug: string) {
    const doc = await this.prisma.cmsDocument.findUnique({ where: { slug } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async updateDocument(slug: string, dto: UpdateCmsDocumentDto, adminId?: string) {
    return this.prisma.cmsDocument.upsert({
      where: { slug },
      update: {
        content: dto.content,
        lastUpdatedBy: adminId || 'SYSTEM',
      },
      create: {
        slug,
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        content: dto.content,
        lastUpdatedBy: adminId || 'SYSTEM',
      }
    });
  }

  // --- FAQs Public & Private Accessors ---

  async getFaqs(onlyActive: boolean = false) {
    return this.prisma.faq.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createFaq(dto: CreateFaqDto) {
    const maxOrder = await this.prisma.faq.aggregate({ _max: { displayOrder: true } });
    const nextOrder = dto.displayOrder ?? ((maxOrder._max.displayOrder || 0) + 1);

    return this.prisma.faq.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        displayOrder: nextOrder,
      },
    });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    return this.prisma.faq.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFaq(id: string) {
    return this.prisma.faq.delete({ where: { id } });
  }

  async updateFaqOrders(orders: { id: string, displayOrder: number }[]) {
     for (const o of orders) {
         await this.prisma.faq.update({ where: { id: o.id }, data: { displayOrder: o.displayOrder }});
     }
     return { success: true };
  }
}
