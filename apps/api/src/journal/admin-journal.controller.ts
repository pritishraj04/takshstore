import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto, UpdateJournalDto } from './dto/journal.dto';
import {
  AdminPermissionsGuard,
  RequirePermission,
} from '../admin-auth/guards/rbac.guard';

@Controller('admin/journals')
@UseGuards(AdminPermissionsGuard)
export class AdminJournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @RequirePermission('articles', 'READ')
  async getJournals() {
    return this.journalService.getAdminJournals();
  }

  @Post()
  @RequirePermission('articles', 'WRITE')
  async createJournal(@Body() dto: CreateJournalDto) {
    return this.journalService.createJournal(dto);
  }

  @Patch(':id')
  @RequirePermission('articles', 'WRITE')
  async updateJournal(@Param('id') id: string, @Body() dto: UpdateJournalDto) {
    return this.journalService.updateJournal(id, dto);
  }

  @Delete(':id')
  @RequirePermission('articles', 'WRITE')
  async deleteJournal(@Param('id') id: string) {
    return this.journalService.deleteJournal(id);
  }
}
