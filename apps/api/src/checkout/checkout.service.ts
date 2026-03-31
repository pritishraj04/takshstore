import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from '../payments/razorpay.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class CheckoutService {
  // Default fallbacks if keys missing from DB
  private readonly FALLBACK_BASE_RATE = 150;
  private readonly FALLBACK_THRESHOLD = 5000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async calculateCartTotals(userId: string, items: { productId: string, quantity: number }[]) {
    // 1. Fetch Dynamic Settings from DB
    const dbSettings = await this.prisma.storeSetting.findMany({
      where: {
        key: { in: ['FREE_SHIPPING_THRESHOLD', 'STANDARD_SHIPPING_RATE'] }
      }
    });

    const settingsMap = dbSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const threshold = Number(settingsMap['FREE_SHIPPING_THRESHOLD']) || this.FALLBACK_THRESHOLD;
    const baseRate = Number(settingsMap['STANDARD_SHIPPING_RATE']) || this.FALLBACK_BASE_RATE;

    let subtotal = 0;
    let hasPhysicalItems = false;
    
    // Process items and identify product types
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new BadRequestException(`Product reference invalid: ${item.productId}`);
      }

      const price = product.discountedPrice || product.price;
      subtotal += price * item.quantity;

      if (product.type === 'PHYSICAL') {
        hasPhysicalItems = true;
      }
    }

    let shippingCharge = 0;
    
    if (hasPhysicalItems) {
      if (subtotal >= threshold) {
        shippingCharge = 0;
      } else {
        shippingCharge = baseRate;
      }
    } else {
      // Digital only cart = Not Applicable
      shippingCharge = 0;
    }

    const amountToFreeShipping = Math.max(0, threshold - subtotal);
    const totalAmount = subtotal + shippingCharge;

    return {
      subtotal,
      shippingCharge,
      totalAmount,
      amountToFreeShipping,
      hasPhysicalItems,
      freeShippingThreshold: threshold, // Pass this to frontend for progress bar accuracy
      isDigitalOnly: !hasPhysicalItems && items.length > 0
    };
  }

  async initiateCheckout(
    userId: string,
    requestedTotal: number, // We verify this against our calculation
    items: any[],
    shippingAddress?: any,
    developerNotes?: string,
    payload: any = {},
  ) {
    // 1. Calculate securely on backend
    const { subtotal, shippingCharge, totalAmount } = await this.calculateCartTotals(userId, items.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    })));

    // For safety, we use our calculated total for the actual payment intent
    const finalAmountToPay = totalAmount;

    // Optional: Log if frontend sent discrepant totals
    if (Math.abs(requestedTotal - totalAmount) > 1) {
      console.warn(`Price Discrepancy! Frontend sent: ${requestedTotal}, Backend calculated: ${totalAmount}. Forcing backend total.`);
    }

    // Reuse the existing validation logic from previous check
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product)
        throw new BadRequestException(`Product not found: ${item.productId}`);

      // Stock validation
      if (product.stockCount !== null && product.stockCount !== undefined) {
        if (product.stockCount <= 0) {
          throw new BadRequestException(`"${product.title}" is out of stock`);
        }
        if (item.quantity > product.stockCount) {
          throw new BadRequestException(`Only ${product.stockCount} left of "${product.title}"`);
        }
      }
    }

    // 1. Identify orphaned shell orders to clean up later
    const shellOrdersToCleanup: { orderId: string; orderItemId: string }[] = [];

    for (const item of items) {
      if (item.type === 'DIGITAL' && item.draftId) {
        const draft = await this.prisma.digitalInvite.findUnique({
          where: { id: item.draftId },
          include: { orderItem: { include: { order: true } } },
        });

        // If the old parent order was a $0 PENDING shell order, mark it for deletion
        if (
          draft?.orderItem?.order?.totalAmount === 0 &&
          draft?.orderItem?.order?.status === 'PENDING'
        ) {
          shellOrdersToCleanup.push({
            orderId: draft.orderItem.orderId,
            orderItemId: draft.orderItemId,
          });
        }
      }
    }

    // Create a basic order
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount: finalAmountToPay,
        subtotal: subtotal,
        discountAmount: payload.discountAmount || 0,
        couponCode: payload.couponCode || null,
        shippingCost: shippingCharge,
        shippingAddress,
        developerNotes,
        items: {
          create: items.map((item) => {
            const baseItem: any = {
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              hasPaidEternity: item.isEternity === true,
            };

            if (item.type === 'DIGITAL') {
              let validMarriageDate: Date | null = null;
              if (item.marriageDate) {
                const parsedDate = new Date(item.marriageDate);
                if (!isNaN(parsedDate.getTime())) {
                  validMarriageDate = parsedDate;
                }
              }

              if (item.draftId) {
                // If a draft exists, CONNECT to it
                baseItem.digitalInvite = {
                  connect: { id: item.draftId },
                };
              } else {
                // Fallback for edge cases where no draft exists
                baseItem.digitalInvite = {
                  create: {
                    inviteData: item.inviteData || {},
                    status: 'DRAFT',
                    isEternity: item.isEternity === true,
                    marriageDate: validMarriageDate,
                  },
                };
              }
            }
            return baseItem;
          }),
        },
      },
    });

    // Update existing drafts with the final checkout data
    for (const item of items) {
      if (item.type === 'DIGITAL' && item.draftId) {
        let validMarriageDate: Date | null = null;
        if (item.marriageDate) {
          const parsedDate = new Date(item.marriageDate);
          if (!isNaN(parsedDate.getTime())) {
            validMarriageDate = parsedDate;
          }
        }

        await this.prisma.digitalInvite.update({
          where: { id: item.draftId },
          data: {
            inviteData: item.inviteData || {},
            isEternity: item.isEternity === true,
            marriageDate: validMarriageDate,
            // Status remains DRAFT until payment is verified via Webhook
          },
        });
      }
    }

    // Initialize Razorpay
    const rzpOrder = await this.razorpayService.createOrder(
      finalAmountToPay,
      order.id,
    );

    if (!rzpOrder || !rzpOrder.id) {
      throw new InternalServerErrorException(
        'Failed to secure order with Razorpay',
      );
    }

    // Save razorpayOrderId
    await this.prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    // Clean up orphaned shell orders
    for (const shell of shellOrdersToCleanup) {
      try {
        // Delete the empty OrderItem
        await this.prisma.orderItem.delete({
          where: { id: shell.orderItemId },
        });
        // Delete the empty parent Order
        await this.prisma.order.delete({
          where: { id: shell.orderId },
        });
      } catch (error) {
        console.error(`Failed to clean up shell order ${shell.orderId}:`, error);
      }
    }

    return {
      id: order.id,
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    };
  }

  async verifyCheckout(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ) {
    const isValid = this.razorpayService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    const order = await this.prisma.order.findUnique({
      where: { razorpayOrderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // processOrderSuccess sets status to PAID and triggers MailService
    await this.paymentsService.processOrderSuccess(order.id);

    return { success: true };
  }

  async retryCheckout(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new BadRequestException('Order not found or access denied');
    }

    if (order.status === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    const amountToPay = order.totalAmount;

    const rzpOrder = await this.razorpayService.createOrder(
      amountToPay,
      order.id,
    );

    if (!rzpOrder || !rzpOrder.id) {
      throw new InternalServerErrorException(
        'Failed to secure order with Razorpay',
      );
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: rzpOrder.id,
      },
    });

    return {
      id: order.id,
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    };
  }
}
