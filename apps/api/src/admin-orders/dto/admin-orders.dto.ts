import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';
import { OrderStatus, ProductType } from '@prisma/client';

export class ForceUpdateInviteDto {
  @IsString()
  @IsOptional()
  brideName?: string;

  @IsString()
  @IsOptional()
  groomName?: string;

  @IsDateString()
  @IsOptional()
  eventDate?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  trackingUrl?: string;
}

export class CreateManualOrderDto {
  @IsString()
  userId: string;
  
  @IsString()
  productId: string;

  @IsEnum(ProductType)
  orderType: ProductType;

  @IsNumber()
  customPrice: number;

  @IsEnum(OrderStatus)
  paymentStatus: OrderStatus;

  @IsBoolean()
  sendEmailReceipt: boolean;

  @IsOptional()
  @IsObject()
  shippingAddress?: any;
}
