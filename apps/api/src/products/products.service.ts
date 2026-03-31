import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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
    // Basic idempotent seed: clear existing to avoid duplicates during repeated seeds
    await this.prisma.product.deleteMany();

    const physical = await this.prisma.product.create({
      data: {
        title: 'Premium Canvas Print',
        price: 199.99,
        type: ProductType.PHYSICAL,
        imageUrl: '/main-website-assets/images/placeholder.webp',
      },
    });

    const digital = await this.prisma.product.create({
      data: {
        title: 'Customizer Base Invite',
        price: 49.99,
        type: ProductType.DIGITAL,
        imageUrl: '/main-website-assets/images/placeholder.webp',
      },
    });

    return { message: 'Seeding complete', physical, digital };
  }
}
