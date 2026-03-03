import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DigitalInvitesService {
    constructor(private readonly prisma: PrismaService) { }

    async checkSlugAvailability(slug: string) {
        if (!slug || slug.trim().length === 0) {
            throw new BadRequestException('Slug cannot be empty');
        }

        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

        const existingInvite = await this.prisma.digitalInvite.findUnique({
            where: { slug: normalizedSlug }
        });

        if (!existingInvite) {
            return { available: true };
        }

        // Generate suggestions if taken
        const currentYear = new Date().getFullYear();
        const suggestions = [
            `${normalizedSlug}-${currentYear}`,
            `${normalizedSlug}-${Math.floor(100 + Math.random() * 900)}`,
            normalizedSlug.split('-').reverse().join('-')
        ];

        return {
            available: false,
            suggestions
        };
    }

    async getInvitesByUser(userId: string) {
        return this.prisma.digitalInvite.findMany({
            where: {
                orderItem: {
                    order: {
                        userId: userId
                    }
                }
            },
            include: {
                orderItem: {
                    include: { order: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getInviteBySlug(slug: string) {
        if (!slug || slug.trim().length === 0) {
            throw new BadRequestException('Slug cannot be empty');
        }

        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

        const invite = await this.prisma.digitalInvite.findUnique({
            where: { slug: normalizedSlug },
            include: {
                orderItem: {
                    include: {
                        order: {
                            select: { status: true }
                        }
                    }
                }
            }
        });

        if (!invite) {
            return null; // Controller will handle 404
        }

        return invite;
    }

    async getInviteById(id: string) {
        return this.prisma.digitalInvite.findUnique({
            where: { id },
            include: {
                orderItem: {
                    include: {
                        order: {
                            select: {
                                status: true
                            }
                        }
                    }
                }
            }
        });
    }

    async updateInvite(id: string, inviteData: any) {
        // Also ensure slug cascades to the root column if the frontend passes it inside the payload
        const payloadSlug = inviteData?.slug || null;
        const normalizedSlug = payloadSlug ? payloadSlug.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;

        const data: any = { inviteData };
        if (normalizedSlug) {
            data.slug = normalizedSlug;
        }

        return this.prisma.digitalInvite.update({
            where: { id },
            data
        });
    }
}
