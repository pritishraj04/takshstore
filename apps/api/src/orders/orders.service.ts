import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductType } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly paymentsService: PaymentsService
    ) { }

    async createOrder(userId: string, dto: CreateOrderDto) {
        // Pre-flight check: Ensure all products in the cart actually exist in the database
        // This prevents 500 Foreign Key constraint errors when users have stale localStorage carts
        const uniqueProductIds = [...new Set(dto.items.map(item => item.productId))];
        const existingProducts = await this.prisma.product.findMany({
            where: { id: { in: uniqueProductIds } }
        });

        if (existingProducts.length !== uniqueProductIds.length) {
            throw new BadRequestException('One or more products in your cart no longer exist. Please clear your cart and try again.');
        }

        // Step 1: Create the transaction
        const orderRecord = await this.prisma.$transaction(async (tx) => {
            // Step A: Create the Order record
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount: dto.totalAmount,
                    shippingAddress: dto.shippingAddress ?? null,
                    developerNotes: dto.developerNotes ?? null,
                },
            });

            // Step B: Loop through the dto.items
            for (const item of dto.items) {
                // Step C: Create OrderItem linked to Order
                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        priceAtPurchase: item.priceAtPurchase,
                        hasPaidEternity: item.isEternity === true,
                    },
                });

                // Step D: Create DigitalInvite if type is DIGITAL
                if (item.type === ProductType.DIGITAL && item.inviteData) {
                    let validMarriageDate: Date | null = null;
                    if (item.marriageDate) {
                        const parsedDate = new Date(item.marriageDate);
                        if (!isNaN(parsedDate.getTime())) {
                            validMarriageDate = parsedDate;
                        } else {
                            throw new BadRequestException(`Invalid marriage date provided for digital product ${item.productId}`);
                        }
                    }

                    if (item.draftId) {
                        // Link the existing draft to the new OrderItem and update status
                        await tx.digitalInvite.update({
                            where: { id: item.draftId },
                            data: {
                                orderItemId: orderItem.id,
                                status: 'DEVELOPMENT',
                                inviteData: item.inviteData,
                                slug: (item.inviteData as any).slug || null,
                                isEternity: item.isEternity === true,
                                marriageDate: validMarriageDate,
                            }
                        });
                    } else {
                        await tx.digitalInvite.create({
                            data: {
                                orderItemId: orderItem.id,
                                inviteData: item.inviteData,
                                slug: (item.inviteData as any).slug || null,
                                isEternity: item.isEternity === true,
                                marriageDate: validMarriageDate,
                            },
                        });
                    }
                }
            }

            // Return fully nested Order
            return tx.order.findUnique({
                where: { id: order.id },
                include: {
                    items: {
                        include: {
                            digitalInvite: true,
                            product: true,
                        },
                    },
                },
            });
        });

        return {
            order: orderRecord,
        };
    }

    async findAll(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        digitalInvite: true,
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(orderId: string, userId: string) {
        console.log(`[DEBUG OrdersService] Looking for orderId: ${orderId}, userId: ${userId}`);
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        digitalInvite: true,
                        product: true,
                    },
                },
            },
        });

        console.log(`[DEBUG OrdersService] Prisma result:`, order ? `Found order ${order.id}` : `null`);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('Access denied to this order');
        }

        return order;
    }
}
