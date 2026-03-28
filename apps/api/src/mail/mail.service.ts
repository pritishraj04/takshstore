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

  async sendAdminInvite(email: string, setupToken: string) {
    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/onboarding?token=${setupToken}`;

    try {
      const info = await this.transporter.sendMail({
        // from: '"Taksh Logistics" <noreply@taksh.store>',
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
        // from: '"Taksh Sales" <orders@taksh.store>',
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
        // from: '"Taksh Digital" <digital@taksh.store>',
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
        // from: '"Taksh Dispatch" <shipping@taksh.store>',
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
        // from: '"Taksh Store" <security@taksh.store>',
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
