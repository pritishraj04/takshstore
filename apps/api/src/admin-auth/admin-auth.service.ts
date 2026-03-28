import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminStatus, PermissionLevel } from '@prisma/client';
import {
  InviteSubAdminDto,
  AdminLoginDto,
  SetupPasswordDto,
} from './dto/admin-auth.dto';
import { Response } from 'express';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async inviteSubAdmin(
    email: string,
    name: string,
    permissions: Record<string, PermissionLevel>,
  ) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ForbiddenException(
        'Admin user with this email already exists.',
      );
    }

    const user = await this.prisma.adminUser.create({
      data: {
        email,
        name,
        status: AdminStatus.PENDING,
        permissions: {
          create: {
            orders: permissions?.orders || PermissionLevel.NONE,
            customers: permissions?.customers || PermissionLevel.NONE,
            categories: permissions?.categories || PermissionLevel.NONE,
            products: permissions?.products || PermissionLevel.NONE,
            subAdmins: permissions?.subAdmins || PermissionLevel.NONE,
            articles: permissions?.articles || PermissionLevel.NONE,
            cms: permissions?.cms || PermissionLevel.NONE,
            coupons: permissions?.coupons || PermissionLevel.NONE,
          },
        },
      },
      include: { permissions: true },
    });

    const token = this.jwtService.sign(
      { id: user.id, type: 'SETUP' },
      {
        expiresIn: '24h',
        secret:
          process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
      },
    );

    // Trigger explicit SMTP
    await this.mailService.sendAdminInvite(email, token);

    return { message: 'Invitation deployed', token };
  }

  async setupPassword(token: string, newPassword: string) {
    let payload;
    try {
      payload = this.jwtService.verify(token, {
        secret:
          process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
      });
    } catch (e) {
      throw new BadRequestException('Invalid or expired setup token.');
    }

    if (payload.type !== 'SETUP') {
      throw new BadRequestException('Invalid token type.');
    }

    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.status !== AdminStatus.PENDING) {
      throw new BadRequestException('Setup link has already been used.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: AdminStatus.ACTIVE,
      },
    });

    return { message: 'Password setup successful. You can now login.' };
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { email },
      include: { permissions: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active.');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set up.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      type: 'SESSION',
      isSuper: user.isSuper,
      permissions: user.permissions,
    };

    const token = this.jwtService.sign(payload, {
      secret:
        process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
      expiresIn: '12h',
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuper: user.isSuper,
        permissions: user.permissions,
      },
    };
  }
}
