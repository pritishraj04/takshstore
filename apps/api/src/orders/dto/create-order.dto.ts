import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ProductType } from '@prisma/client';

export class OrderItemDto {
    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    priceAtPurchase: number;

    @IsEnum(ProductType)
    type: ProductType;

    @IsOptional()
    inviteData?: any;

    @IsOptional()
    @IsString()
    draftId?: string;
}

export class CreateOrderDto {
    @IsNumber()
    totalAmount: number;

    @IsOptional()
    shippingAddress?: any;

    @IsOptional()
    @IsString()
    developerNotes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
