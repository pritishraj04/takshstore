import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
