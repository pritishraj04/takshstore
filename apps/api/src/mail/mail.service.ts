import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AdminInviteTemplate, CanvasOrderReceipt, DigitalInviteAccess } from './templates/email.templates';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASSWORD || 'ethereal_pass',
      },
    });
  }

  async sendAdminInvite(email: string, setupToken: string) {
    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/onboarding?token=${setupToken}`;
    
    try {
      await this.transporter.sendMail({
        from: '"Taksh Logistics" <noreply@taksh.store>',
        to: email,
        subject: 'Secure Access: Admin Portal Setup',
        html: AdminInviteTemplate(setupLink),
      });
      this.logger.log(`Admin invitation explicitly transmitted to ${email}`);
    } catch (e: any) {
      this.logger.error(`Transmission failure resolving admin invite: ${e.message}`);
    }
  }

  async sendCanvasReceipt(email: string, orderDetailsText: string) {
    try {
      await this.transporter.sendMail({
        from: '"Taksh Sales" <orders@taksh.store>',
        to: email,
        subject: 'Confirmed: Your Canvas Print',
        html: CanvasOrderReceipt(orderDetailsText),
      });
      this.logger.log(`Physical receipt relayed to ${email}`);
    } catch (e: any) {
      this.logger.error(`Receipt sequence failure: ${e.message}`);
    }
  }

  async sendDigitalInviteAccess(email: string, customizerLink: string) {
    try {
      await this.transporter.sendMail({
        from: '"Taksh Digital" <digital@taksh.store>',
        to: email,
        subject: 'Action Required: Your Customizer Link is Live',
        html: DigitalInviteAccess(customizerLink),
      });
      this.logger.log(`Digital interactive sequence relayed to ${email}`);
    } catch (e: any) {
      this.logger.error(`Digital URL link failure: ${e.message}`);
    }
  }
}
