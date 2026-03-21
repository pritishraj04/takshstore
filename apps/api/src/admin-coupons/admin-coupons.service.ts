import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/admin-coupons.dto';

@Injectable()
export class AdminCouponsService {
  constructor(private prisma: PrismaService) {}

  async getCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(dto: CreateCouponDto) {
    const cleanedCode = dto.code.replace(/\s+/g, '').toUpperCase();
    if (dto.discountType === 'PERCENTAGE' && dto.discountValue > 100) {
        throw new BadRequestException('Percentage block caps at 100 explicitly.');
    }

    const exists = await this.prisma.coupon.findUnique({ where: { code: cleanedCode } });
    if (exists) throw new BadRequestException('Unique structural block compromised.');

    return this.prisma.coupon.create({
      data: {
          ...dto,
          code: cleanedCode,
          validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      }
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const cleanedCode = dto.code.replace(/\s+/g, '').toUpperCase();
    if (dto.discountType === 'PERCENTAGE' && dto.discountValue > 100) {
        throw new BadRequestException('Percentage block caps at 100 explicitly.');
    }

    const exists = await this.prisma.coupon.findUnique({ where: { id }});
    if (!exists) throw new NotFoundException('Block mapping unresolved');

    return this.prisma.coupon.update({
      where: { id },
      data: {
          ...dto,
          code: cleanedCode,
          validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      }
    });
  }

  async toggleStatus(id: string) {
    const cop = await this.prisma.coupon.findUnique({ where: { id } });
    if (!cop) throw new NotFoundException('Block mapping unresolved');

    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !cop.isActive }
    });
  }
}
