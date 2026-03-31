import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import type { Response } from 'express';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(
    @Body() createContactDto: CreateContactDto,
    @Res() res: Response
  ) {
    if (createContactDto.website_url) {
      // Bot detected - simulate success
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Your inquiry has been received'
      });
    }

    const response = await this.contactService.create(createContactDto);
    return res.status(HttpStatus.CREATED).json(response);
  }
}
