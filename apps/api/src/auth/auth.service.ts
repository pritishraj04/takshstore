import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch (error: any) {
      console.error('ERROR IN REGISTER:', error);
      throw new BadRequestException(
        error?.message || 'Unknown error during register',
      );
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email, type } = dto;
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (type === 'ADMIN') {
      const admin = await this.prisma.adminUser.findUnique({ where: { email } });
      if (admin) {
        await this.prisma.adminUser.update({
          where: { id: admin.id },
          data: { resetToken: token, resetTokenExpiry: expiry },
        });
        await this.mailService.sendPasswordReset(email, token, 'ADMIN');
      }
    } else {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { resetToken: token, resetTokenExpiry: expiry },
        });
        await this.mailService.sendPasswordReset(email, token, 'USER');
      }
    }

    // Always return success regardless of whether email was found (security best practice)
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword, type } = dto;

    if (type === 'ADMIN') {
      const admin = await this.prisma.adminUser.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!admin) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    } else {
      const user = await this.prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    }

    return { message: 'Password has been reset successfully' };
  }
}
