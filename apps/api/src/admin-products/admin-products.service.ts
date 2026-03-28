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

    return this.prisma.product.update({
      where: { id },
      data: dto,
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
