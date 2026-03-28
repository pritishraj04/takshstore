import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.validFrom && new Date() < coupon.validFrom) {
      throw new BadRequestException('This coupon is not yet valid');
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    return {
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      code: coupon.code,
    };
  }

  async getFeatured() {
    return this.prisma.coupon.findFirst({
      where: {
        isFeaturedOnHome: true,
        isActive: true,
      },
    });
  }
}
