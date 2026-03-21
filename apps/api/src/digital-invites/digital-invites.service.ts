import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getEditDistance } from '../utils/levenshtein';

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

    async getInviteById(id: string, userId: string) {
        const invite = await this.prisma.digitalInvite.findFirst({
            where: { 
                id,
                orderItem: {
                    order: {
                        userId: userId
                    }
                }
            },
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

        if (!invite) throw new NotFoundException('Invite not found');

        return {
            ...invite,
            isPaid: invite.orderItem?.order?.status === 'PAID'
        };
    }

    async updateInvite(id: string, userId: string, inviteData: any, status?: any) {
        // Enforce ownership: Will throw NotFoundException if not owned by the user
        const existingInvite = await this.getInviteById(id, userId);

        const isPaid = existingInvite.isPaid || existingInvite.status === 'DEVELOPMENT' || existingInvite.status === 'PUBLISHED';

        // Exploit Guards
        if (isPaid) {
            const existingData = existingInvite.inviteData as any;
            const incomingData = inviteData as any;

            // Guard A: Typo-Tolerance (Max 3 character changes allowed)
            const existingBrideName = (existingInvite.originalBrideName || '').toLowerCase();
            const incomingBrideName = (incomingData?.couple?.bride?.name || '').toLowerCase();
            const existingGroomName = (existingInvite.originalGroomName || '').toLowerCase();
            const incomingGroomName = (incomingData?.couple?.groom?.name || '').toLowerCase();

            const brideDistance = getEditDistance(existingBrideName, incomingBrideName);
            const groomDistance = getEditDistance(existingGroomName, incomingGroomName);

            if (brideDistance > 3 || groomDistance > 3) {
                throw new BadRequestException('Major name changes are locked. You can only correct minor typos (max 3 characters) from the original purchased names.');
            }

            // Guard B: Date Horizon Lock (Max 90 days from original)
            if (existingInvite.originalEventDate && incomingData?.celebrations && Array.isArray(incomingData.celebrations)) {
                const times = incomingData.celebrations
                    .map((c: any) => new Date(c.date).getTime())
                    .filter((t: number) => !isNaN(t));

                if (times.length > 0) {
                    const incomingLatestDate = new Date(Math.max(...times));
                    const horizonDate = new Date(existingInvite.originalEventDate);
                    horizonDate.setDate(horizonDate.getDate() + 90);

                    if (incomingLatestDate > horizonDate) {
                        throw new BadRequestException('Event dates cannot be postponed more than 90 days from the original purchased date.');
                    }
                }
            }
        }

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

            const defaultInviteData = {
                couple: {
                    primaryOrder: 'BRIDE_FIRST',
                    bride: {
                        name: "",
                        parents: { mother: "", father: "", order: 'MOTHER_FIRST' }
                    },
                    groom: {
                        name: "",
                        parents: { mother: "", father: "", order: 'FATHER_FIRST' }
                    },
                    hashtag: "",
                    image: "/main-website-assets/images/placeholder.webp"
                },
                wedding: {
                    displayDate: ""
                },
                celebrations: [
                    { id: "event-1", name: "", date: "", time: "", venue: "", googleMapsUrl: "", dressCode: "", showLocation: false, highlight: false },
                ],
                messages: {
                    inviteText: "With joyful hearts, we invite you to share in our happiness as we begin our new life together. Join us for an evening of love, laughter, and celebration.",
                    socialShareText: "With immense joy and heartfelt happiness, we, as a family, request the honor of your presence at the wedding of [Bride] and [Groom]. As they begin a beautiful journey...",
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
        // Validate ownership and status before deleting by incorporating userId natively in the query
        const invite = await this.prisma.digitalInvite.findFirst({
            where: { 
                id,
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
            }
        });

        if (!invite) {
            throw new NotFoundException('Draft not found');
        }

        if (invite.status !== 'DRAFT') {
            throw new BadRequestException('Cannot delete a published or paid invite');
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
