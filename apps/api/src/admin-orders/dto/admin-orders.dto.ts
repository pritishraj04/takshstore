import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

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
}
