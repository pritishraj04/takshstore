import { IsEnum, IsNumber, IsOptional, IsString, IsInt, IsBoolean, IsDateString, Max } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @IsString() code: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(DiscountType) discountType: DiscountType;
  @IsNumber() discountValue: number;
  
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsInt() @IsOptional() maxUses?: number;
  
  @IsDateString() @IsOptional() validFrom?: string;
  @IsDateString() @IsOptional() validUntil?: string;

  @IsBoolean() @IsOptional() isFeaturedOnHome?: boolean;
  @IsString() @IsOptional() homeBannerImage?: string;
}

export class UpdateCouponDto extends CreateCouponDto {}
