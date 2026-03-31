import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        const systemTags = [
            { name: 'Bestseller', slug: 'bestseller' },
            { name: 'Popular', slug: 'popular' },
            { name: 'Highly Rated', slug: 'highly-rated' }
        ];

        for (const tag of systemTags) {
            await this.prisma.tag.upsert({
                where: { slug: tag.slug },
                update: { name: tag.name, isSystem: true },
                create: { ...tag, isSystem: true }
            });
        }
    }

    async findAll() {
        return this.prisma.tag.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const tag = await this.prisma.tag.findUnique({
            where: { id }
        });
        if (!tag) throw new NotFoundException('Tag not found');
        return tag;
    }

    async create(data: { name: string, slug: string }) {
        return this.prisma.tag.create({
            data: {
                ...data,
                isSystem: false
            }
        });
    }

    async update(id: string, data: { name?: string, slug?: string }) {
        const tag = await this.findOne(id);
        if (tag.isSystem) {
            throw new BadRequestException('System tags cannot be modified');
        }
        return this.prisma.tag.update({
            where: { id },
            data
        });
    }

    async remove(id: string) {
        const tag = await this.findOne(id);
        if (tag.isSystem) {
            throw new BadRequestException('System tags cannot be deleted');
        }
        return this.prisma.tag.delete({
            where: { id }
        });
    }
}
