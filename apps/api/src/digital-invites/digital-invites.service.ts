import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
        const invites = await this.prisma.digitalInvite.findMany({
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

        return invites.map(invite => ({
            ...invite,
            isPaid: invite.orderItem?.order?.status === 'PAID'
        }));
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

        return {
            ...invite,
            isPaid: invite.orderItem?.order?.status === 'PAID'
        };
    }

    async getInviteById(id: string) {
        const invite = await this.prisma.digitalInvite.findUnique({
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

        if (!invite) return null;

        return {
            ...invite,
            isPaid: invite.orderItem?.order?.status === 'PAID'
        };
    }

    async updateInvite(id: string, inviteData: any, status?: any) {
        // Also ensure slug cascades to the root column if the frontend passes it inside the payload
        const payloadSlug = inviteData?.slug || null;
        const normalizedSlug = payloadSlug ? payloadSlug.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;

        const data: any = { inviteData };
        if (normalizedSlug) {
            data.slug = normalizedSlug;
        }

        if (status) {
            data.status = status;
        }

        return this.prisma.digitalInvite.update({
            where: { id },
            data
        });
    }

    async createDraft(userId: string, productId: string) {
        // Validate the product exists and is DIGITAL
        const product = await this.prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product || product.type !== 'DIGITAL') {
            throw new BadRequestException('Invalid digital product');
        }

        // We need a placeholder Order and OrderItem to satisfy the Prisma relations
        // since a DigitalInvite MUST have an OrderItem according to schema.prisma
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount: 0,
                    status: 'PENDING',
                }
            });

            const orderItem = await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: product.id,
                    priceAtPurchase: 0,
                    quantity: 1
                }
            });

            // Initial default placeholder values
            const defaultInviteData = {
                couple: {
                    bride: {
                        name: "Bride Name",
                        parents: { mother: "Mother's Name", father: "Father's Name" }
                    },
                    groom: {
                        name: "Groom Name",
                        parents: { mother: "Mother's Name", father: "Father's Name" }
                    },
                    hashtag: "#OurWedding",
                    image: ""
                },
                wedding: {
                    displayDate: "To Be Announced"
                },
                celebrations: [
                    { id: "event-1", name: "Wedding Celebration", date: "", time: "", venue: "To Be Decided", googleMapsUrl: "", dressCode: "", showLocation: false },
                ],
                messages: {
                    inviteText: "Together with our families, we joyfully invite you to celebrate our wedding.",
                    whatsappContact: "",
                    youtubeLink: "",
                    optionalNote: ""
                },
                slug: ""
            };

            const invite = await tx.digitalInvite.create({
                data: {
                    orderItemId: orderItem.id,
                    inviteData: defaultInviteData,
                    status: 'DRAFT'
                }
            });

            return invite;
        });
    }

    async deleteDraft(userId: string, id: string) {
        // Validate ownership and status before deleting
        const invite = await this.prisma.digitalInvite.findUnique({
            where: { id },
            include: {
                orderItem: {
                    include: { order: true }
                }
            }
        });

        if (!invite) {
            throw new NotFoundException('Draft not found');
        }

        if (invite.status !== 'DRAFT') {
            throw new BadRequestException('Cannot delete a published or paid invite');
        }

        if (invite.orderItem.order.userId !== userId) {
            throw new BadRequestException('Access denied');
        }

        // Delete dependencies safely within a transaction
        return this.prisma.$transaction(async (tx) => {
            const orderId = invite.orderItem.orderId;
            const orderItemId = invite.orderItemId;

            await tx.digitalInvite.delete({ where: { id } });
            await tx.orderItem.delete({ where: { id: orderItemId } });

            // Only delete the order if it's the shell 0 amount order used for drafts
            if (invite.orderItem.order.status === 'PENDING' && invite.orderItem.order.totalAmount === 0) {
                await tx.order.delete({ where: { id: orderId } });
            }

            return { success: true };
        });
    }
}
