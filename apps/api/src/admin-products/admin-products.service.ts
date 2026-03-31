import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/admin-products.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class AdminProductsService {
  constructor(private prisma: PrismaService) {}

  async getProducts(category?: 'CANVAS' | 'DIGITAL') {
    const whereClause: any = {};
    if (category === 'CANVAS') whereClause.type = 'PHYSICAL';
    if (category === 'DIGITAL') whereClause.type = 'DIGITAL';

    return this.prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        _count: {
          select: { orderItems: true },
        },
      },
    });
  }

  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Product mapping unresolved');

    const { tagIds, ...rest } = dto;

    const data: any = rest;
    if (tagIds !== undefined) {
      data.tags = {
        set: tagIds.map((tid) => ({ id: tid })),
      };
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
    });

    await this.syncSystemTags(id);

    return updated;
  }

  async syncSystemTags(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { tags: true },
    });

    if (!product) return;

    const systemTags = await this.prisma.tag.findMany({
      where: { isSystem: true },
    });

    const tagsToConnect: { id: string }[] = [];
    const tagsToDisconnect: { id: string }[] = [];

    // Bestseller: salesCount > 50
    const bestsellerTag = systemTags.find((t) => t.slug === 'bestseller');
    if (bestsellerTag) {
      if (product.salesCount > 50) tagsToConnect.push({ id: bestsellerTag.id });
      else tagsToDisconnect.push({ id: bestsellerTag.id });
    }

    // Popular: viewCount > 500
    const popularTag = systemTags.find((t) => t.slug === 'popular');
    if (popularTag) {
      if (product.viewCount > 500) tagsToConnect.push({ id: popularTag.id });
      else tagsToDisconnect.push({ id: popularTag.id });
    }

    // Highly Rated: averageRating >= 4.5
    const highlyRatedTag = systemTags.find((t) => t.slug === 'highly-rated');
    if (highlyRatedTag) {
      if (product.averageRating >= 4.5)
        tagsToConnect.push({ id: highlyRatedTag.id });
      else tagsToDisconnect.push({ id: highlyRatedTag.id });
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        tags: {
          connect: tagsToConnect,
          disconnect: tagsToDisconnect,
        },
      },
    });
  }

  async toggleStatus(id: string) {
    const prod = await this.prisma.product.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException('Product mapping unresolved');

    const newStatus = prod.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

    return this.prisma.product.update({
      where: { id },
      data: { status: newStatus as ProductStatus },
    });
  }

  async checkTemplate(slug: string) {
    const existingProduct = await this.prisma.product.findFirst({
      where: { templateSlug: slug, type: 'DIGITAL' },
    });

    return {
      isUsed: !!existingProduct,
      productName: existingProduct?.title || null,
    };
  }
}
