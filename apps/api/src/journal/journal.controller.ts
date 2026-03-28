import { Controller, Get, Param, Query } from '@nestjs/common';
import { JournalService } from './journal.service';

@Controller('journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  async getJournals(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : undefined;
    return this.journalService.getPublishedJournals(lim);
  }

  @Get(':slug')
  async getJournalBySlug(@Param('slug') slug: string) {
    return this.journalService.getPublishedJournalBySlug(slug);
  }
}
