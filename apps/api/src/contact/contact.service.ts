import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(createContactDto: CreateContactDto) {
    const { name, email, subject, message, website_url } = createContactDto;

    // Honeypot Trap: If website_url is present, it's likely a bot
    if (website_url) {
      this.logger.warn(`Honeypot triggered by submission from ${email}. Silently ignoring.`);
      return { success: true, message: 'Inquiry received successfully' }; // Fake success
    }

    // Save legitimate message to DB
    const contactMessage = await this.prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    // Notify Admins
    this.notifyAdmins(name, email, subject, message).catch((err) => {
      this.logger.error(`Post-submission admin notification failure: ${err.message}`);
    });

    return { 
      success: true, 
      id: contactMessage.id,
      message: 'Thank you for your inquiry. Our team will get back to you shortly.' 
    };
  }

  private async notifyAdmins(name: string, email: string, subject: string, message: string) {
    // Fetch admins with alert subscription active
    const adminsToNotify = await this.prisma.adminUser.findMany({
      where: {
        receivesContactAlerts: true,
        status: 'ACTIVE',
      },
      select: {
        email: true,
      },
    });

    if (!adminsToNotify.length) {
      this.logger.log('No admins configured for active contact alerts.');
      return;
    }

    const emailPromises = adminsToNotify.map((admin) =>
      this.mailService.sendContactAlert(admin.email, name, email, subject, message),
    );

    await Promise.all(emailPromises);
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.contactMessage.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async delete(id: string) {
    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }
}
