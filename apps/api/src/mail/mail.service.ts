import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AdminInviteTemplate, CanvasOrderReceipt, DigitalInviteAccess, OrderShippedNotification } from './templates/email.templates';

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
      this.logger.warn('No SMTP credentials found in environment. Generating a dynamic Ethereal test account...');
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
      this.logger.log(`Generated Ethereal account -> User: ${testAccount.user}`);
    }
  }


  async sendAdminInvite(email: string, setupToken: string) {
    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/onboarding?token=${setupToken}`;
    
    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Logistics" <noreply@taksh.store>',
        to: email,
        subject: 'Secure Access: Admin Portal Setup',
        html: AdminInviteTemplate(setupLink),
      });
      this.logger.log(`Admin invitation explicitly transmitted to ${email}`);
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) this.logger.log(`Preview Email: ${testUrl}`);
    } catch (e: any) {
      this.logger.error(`Transmission failure resolving admin invite: ${e.message}`);
    }
  }

  async sendCanvasReceipt(email: string, orderDetailsText: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Taksh Sales" <orders@taksh.store>',
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
        from: '"Taksh Digital" <digital@taksh.store>',
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
        from: '"Taksh Dispatch" <shipping@taksh.store>',
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
}
