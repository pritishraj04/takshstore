import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        tags: true,
      },
    });
  }

  async findAll(query?: string, tags?: string[]) {
    const where: any = { status: 'ACTIVE' };

    if (query) {
      where.title = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          slug: {
            in: tags,
          },
        },
      };
    }

    return this.prisma.product.findMany({
      where,
      include: {
        tags: true,
      },
    });
  }

  async seed() {
    // Check if we have orders to avoid foreign key violations
    const ordersCount = await this.prisma.order.count();
    if (ordersCount > 0) {
      return { message: 'Database contains orders. Skipping product clear to avoid constraint violations. Manual cleanup required for a fresh seed.' };
    }

    // Safe to clear products if no orders exist
    await this.prisma.product.deleteMany();

    // Ensure system tags exist
    const bestseller = await this.prisma.tag.upsert({
      where: { slug: 'bestseller' },
      update: {},
      create: { name: 'Bestseller', slug: 'bestseller', isSystem: true },
    });

    const popular = await this.prisma.tag.upsert({
      where: { slug: 'popular' },
      update: {},
      create: { name: 'Popular', slug: 'popular', isSystem: true },
    });

    const physical = await this.prisma.product.create({
      data: {
        title: 'Bespoke Abstract Canvas',
        description: 'A hand-painted masterpiece using premium oils and metallic textures. This artwork explores the concept of "Ethereal Flow" - a transition between chaos and calm.',
        price: 24900,
        discountedPrice: 21900,
        type: ProductType.PHYSICAL,
        status: 'ACTIVE',
        imageUrl: '/themes/royal-wedding/assets/images/hero-bg.jpg',
        stockCount: 12,
        width: 24,
        height: 36,
        tags: {
          connect: [{ id: bestseller.id }]
        }
      },
    });

    const digital = await this.prisma.product.create({
      data: {
        title: 'Royal Heritage Digital Suite',
        description: 'An ultra-premium digital invitation suite featuring bespoke typography and animated flourishes. Perfectly tailored for grand celebrations.',
        price: 8900,
        discountedPrice: 7499,
        type: ProductType.DIGITAL,
        status: 'ACTIVE',
        imageUrl: '/themes/royal-wedding/assets/images/placeholder.webp',
        isDigital: true,
        templateSlug: 'royal-heritage',
        tags: {
          connect: [{ id: popular.id }]
        }
      },
    });

    return { message: 'Seeding complete with premium assets', physical, digital };
  }
}
