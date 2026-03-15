import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query?: string) {
        if (!query) {
            return this.prisma.product.findMany();
        }

        return this.prisma.product.findMany({
            where: {
                title: {
                    contains: query,
                    mode: 'insensitive'
                }
            }
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
                imageUrl: 'https://example.com/canvas.jpg',
            },
        });

        const digital = await this.prisma.product.create({
            data: {
                title: 'Customizer Base Invite',
                price: 49.99,
                type: ProductType.DIGITAL,
                imageUrl: 'https://example.com/digital.jpg',
            },
        });

        return { message: 'Seeding complete', physical, digital };
    }
}
