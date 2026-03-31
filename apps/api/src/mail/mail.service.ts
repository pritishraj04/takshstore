import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  AdminInviteTemplate,
  CanvasOrderReceipt,
  DigitalInviteAccess,
  OrderShippedNotification,
} from './templates/email.templates';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  async onModuleInit() {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      this.logger.warn(
        'No SMTP credentials found in environment. Generating a dynamic Ethereal test account...',
      );
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(
        `Generated Ethereal account -> User: ${testAccount.user}`,
      );
    }
  }

  /**
   * Sends email verification link via nodemailer.
   * Uses a placeholder HTML structure ready for polardot.in custom templates.
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify?token=${token}`;

    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Store" <hello@takshstore.com>',
        to: email,
        subject: 'Verify Your Email | Taksh Store',
        html: `
          <!--
            =====================================================================
            POLARDOT.IN CUSTOM HTML5 EMAIL TEMPLATE PLACEHOLDER
            =====================================================================
            Replace the entire <div> block below with your custom HTML5 email
            template from polardot.in. Ensure the template includes:
              1. The verification CTA button pointing to: ${verificationLink}
              2. A plain-text fallback link for email clients that block buttons.
              3. Brand-consistent styling matching Taksh Store's visual identity.
            =====================================================================
          -->
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.15em; margin: 0;">
                Taksh Store
              </h1>
            </div>

            <div style="border: 1px solid #e5e4df; padding: 40px 30px; background-color: #ffffff;">
              <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 400; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 20px 0;">
                Verify Your Email
              </h2>

              <p style="font-size: 14px; line-height: 1.7; color: #4a4a4a; margin: 0 0 12px 0;">
                Welcome to Taksh Store. To complete your registration and start exploring our curated collection, please verify your email address.
              </p>

              <p style="font-size: 14px; line-height: 1.7; color: #4a4a4a; margin: 0 0 30px 0;">
                This link will expire in <strong>24 hours</strong>.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; padding: 16px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 2px;">
                  Verify Email Address
                </a>
              </div>

              <p style="font-size: 11px; color: #9a9a9a; margin: 24px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 11px; color: #9a9a9a; word-break: break-all; margin: 4px 0 0 0;">
                ${verificationLink}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 11px; color: #b0b0b0;">
                If you didn't create an account with Taksh Store, you can safely ignore this email.
              </p>
              <p style="font-size: 10px; color: #c8c8c8; margin-top: 16px;">
                &copy; ${new Date().getFullYear()} Taksh Store. All rights reserved.
              </p>
            </div>
          </div>
          <!-- END POLARDOT.IN TEMPLATE PLACEHOLDER -->
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(`Verification email transmission failure: ${e.message}`);
    }
  }

  async sendAdminInvite(email: string, setupToken: string) {
    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/onboarding?token=${setupToken}`;

    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Logistics" <hello@takshstore.com>',
        to: email,
        subject: 'Secure Access: Admin Portal Setup',
        html: AdminInviteTemplate(setupLink),
      });
      this.logger.log(`Admin invitation explicitly transmitted to ${email}`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(
        `Transmission failure resolving admin invite: ${e.message}`,
      );
    }
  }

  async sendCanvasReceipt(email: string, orderDetailsText: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Sales" <hello@takshstore.com>',
        to: email,
        subject: 'Confirmed: Your Canvas Print',
        html: CanvasOrderReceipt(orderDetailsText),
      });
      this.logger.log(`Physical receipt relayed to ${email}`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(`Receipt sequence failure: ${e.message}`);
    }
  }

  async sendDigitalInviteAccess(email: string, customizerLink: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Digital" <hello@takshstore.com>',
        to: email,
        subject: 'Action Required: Your Customizer Link is Live',
        html: DigitalInviteAccess(customizerLink),
      });
      this.logger.log(`Digital interactive sequence relayed to ${email}`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(`Digital URL link failure: ${e.message}`);
    }
  }

  async sendShippingNotification(email: string, trackingUrl: string | null) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Dispatch" <hello@takshstore.com>',
        to: email,
        subject: 'En Route: Your Frame Has Shipped',
        html: OrderShippedNotification(trackingUrl),
      });
      this.logger.log(`Shipping vector dispatched actively to ${email}`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(`Shipping vector failure: ${e.message}`);
    }
  }

  async sendPasswordReset(email: string, resetToken: string, accountType: 'USER' | 'ADMIN') {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&type=${accountType}`;

    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Store" <hello@takshstore.com>',
        to: email,
        subject: 'Reset Your Password | Taksh Store',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #e5e4df;">
            <h2 style="font-family: serif; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.1em;">Password Reset Request</h2>
            <p>You requested to reset your password for your Taksh Store account.</p>
            <p>Click the button below to set a new one. This link expires in 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background-color: #1a1a1a; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #5a5a5a;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #5a5a5a; word-break: break-all;">${resetLink}</p>
            <hr style="border: none; border-top: 1px solid #e5e4df; margin: 30px 0;" />
            <p style="font-size: 11px; color: #9a9a9a; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset link sent to ${email} (${accountType})`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(`Password reset transmission failure: ${e.message}`);
    }
  }
}
