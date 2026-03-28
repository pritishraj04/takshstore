import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductType, ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString() title: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() price: number;
  @IsNumber() @IsOptional() discountedPrice?: number;
  @IsEnum(ProductType) type: ProductType;
  @IsEnum(ProductStatus) @IsOptional() status?: ProductStatus;

  @IsString() @IsOptional() imageUrl?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() images?: string[];

  // Physical
  @IsNumber() @IsOptional() stockCount?: number;
  @IsNumber() @IsOptional() weight?: number;
  @IsNumber() @IsOptional() width?: number;
  @IsNumber() @IsOptional() height?: number;

  // Digital
  @IsString() @IsOptional() templateSlug?: string;
  @IsString() @IsOptional() defaultAudioUrl?: string;
  @IsBoolean() @IsOptional() isCustomizable?: boolean;
  @IsBoolean() @IsOptional() isDigital?: boolean;
  @IsNumber() @IsOptional() eternityAddonPrice?: number;
}

export class UpdateProductDto extends CreateProductDto {}
