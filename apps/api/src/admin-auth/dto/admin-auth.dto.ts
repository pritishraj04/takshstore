import { IsEmail, IsNotEmpty, IsObject, IsString, MinLength } from 'class-validator';
import { PermissionLevel } from '@prisma/client';

export class InviteSubAdminDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsObject()
  permissions: Record<string, PermissionLevel>;
}

export class SetupPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
