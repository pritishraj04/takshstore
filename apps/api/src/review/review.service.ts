import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { ReviewStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) { }

  // --- Customer Methods ---

  async createReview(userId: string, dto: CreateReviewDto) {
    if (!userId) throw new BadRequestException('User ID is missing');

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId)
      throw new ForbiddenException('Order does not belong to you');

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // 1. Find the specific OrderItem BEFORE checking status
    const orderItem = order.items.find(
      (item) => item.productId === dto.productId,
    );
    if (!orderItem) {
      throw new ForbiddenException('Product not found in this order');
    }

    // 2. Check the ITEM status, not the parent Order status
    if (product.type === 'PHYSICAL' || !product.isDigital) {
      const allowedPhysical = ['DELIVERED', 'COMPLETED', 'SHIPPED'];

      if (!allowedPhysical.includes(orderItem.status)) {
        throw new ForbiddenException(
          'Can only review delivered physical products',
        );
      }
    } else {
      // Digital Product: Item must be PUBLISHED to be reviewed
      if (orderItem.status !== 'PUBLISHED') {
        throw new ForbiddenException(
          'Can only review published digital products',
        );
      }
    }

    // 3. Prevent duplicate reviews
    const existing = await this.prisma.review.findFirst({
      where: { userId, orderId: dto.orderId, productId: dto.productId },
    });

    if (existing)
      throw new ConflictException(
        'You have already reviewed this product for this order',
      );

    // 4. Create the review
    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
        status: 'PENDING',
      },
    });
  }

  async getOrderReviews(userId: string, orderId: string) {
    if (!userId) throw new BadRequestException('User ID is missing');
    return this.prisma.review.findMany({
      where: { userId, orderId },
      select: { productId: true, rating: true, status: true, comment: true },
    });
  }

  // --- Public Methods ---

  async getProductReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, createdAt: true } },
      },
    });
  }

  // --- Admin Methods ---

  async getAdminReviews() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true } },
        order: { select: { id: true, status: true, totalAmount: true } },
      },
    });
  }

  async updateReviewStatus(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
