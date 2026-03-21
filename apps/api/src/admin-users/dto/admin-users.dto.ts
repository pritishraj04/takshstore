import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { AdminStatus, PermissionLevel } from '@prisma/client';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  permissions: Record<string, PermissionLevel>;
}

export class UpdateUserStatusDto {
  @IsEnum(AdminStatus)
  status: AdminStatus;
}
