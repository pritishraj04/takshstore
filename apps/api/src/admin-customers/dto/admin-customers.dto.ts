import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserAccountStatus } from '@prisma/client';

export class UpdateCustomerStatusDto {
  @IsEnum(UserAccountStatus)
  @IsNotEmpty()
  status: UserAccountStatus;
}
