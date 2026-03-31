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
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';
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

      // Generate a secure verification token and 24-hour expiry
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          isVerified: false,
          verificationToken,
          tokenExpiresAt,
        },
      });

      // Send verification email via Resend (fire-and-forget, don't block registration)
      this.mailService
        .sendVerificationEmail(user.email, verificationToken)
        .catch((err) => {
          console.error('Failed to send verification email:', err);
        });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, verificationToken: _token, ...result } = user;
      return {
        ...result,
        message:
          'Account created successfully. Please check your email to verify your account.',
      };
    } catch (error: any) {
      if (error instanceof ConflictException) throw error;
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

    // Block login if email is not yet verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Check your inbox for the verification link.',
      );
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

  /**
   * Verifies a user's email using the token sent to their inbox.
   * Validates token existence and expiry, then marks the user as verified.
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const { token } = dto;

    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token.');
    }

    if (!user.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
      throw new BadRequestException(
        'Verification link has expired. Please request a new one.',
      );
    }

    if (user.isVerified) {
      return { message: 'Email is already verified.' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully.' };
  }

  /**
   * Resends a verification email to a user who hasn't verified yet.
   * Generates a fresh token and 24-hour expiry.
   */
  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success regardless of whether email was found (security best practice)
    if (!user || user.isVerified) {
      return {
        message:
          'If an unverified account with that email exists, a new verification link has been sent.',
      };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, tokenExpiresAt },
    });

    this.mailService
      .sendVerificationEmail(user.email, verificationToken)
      .catch((err) => {
        console.error('Failed to resend verification email:', err);
      });

    return {
      message:
        'If an unverified account with that email exists, a new verification link has been sent.',
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
