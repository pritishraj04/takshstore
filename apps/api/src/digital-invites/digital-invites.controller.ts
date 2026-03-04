import { Controller, Get, Param, NotFoundException, Patch, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { DigitalInvitesService } from './digital-invites.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Digital Invites')
@Controller('digital-invites')
export class DigitalInvitesController {
    constructor(private readonly digitalInvitesService: DigitalInvitesService) { }

    @Get('my-invites')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all digital invites for the authenticated user' })
    async getMyInvites(@Request() req) {
        const userId = req.user?.sub || req.user?.userId;
        return this.digitalInvitesService.getInvitesByUser(userId);
    }

    @Post('draft')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new draft digital invite' })
    async createDraft(@Request() req, @Body() body: { productId: string }) {
        const userId = req.user?.sub || req.user?.userId;
        return this.digitalInvitesService.createDraft(userId, body.productId);
    }

    @Delete('draft/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an existing draft digital invite' })
    async deleteDraft(@Request() req, @Param('id') id: string) {
        const userId = req.user?.sub || req.user?.userId;
        return this.digitalInvitesService.deleteDraft(userId, id);
    }

    @Get('check-slug/:slug')
    @ApiOperation({ summary: 'Check if a custom URL slug is available for a digital invite' })
    async checkSlugAvailability(@Param('slug') slug: string) {
        return this.digitalInvitesService.checkSlugAvailability(slug);
    }

    @Get(':slugOrId')
    @ApiOperation({ summary: 'Get a digital invite by its custom slug or database ID' })
    @ApiResponse({ status: 200, description: 'Return the digital invite.' })
    @ApiResponse({ status: 404, description: 'Invite not found.' })
    async getInvite(@Param('slugOrId') slugOrId: string) {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slugOrId);

        let invite;
        if (isUuid) {
            invite = await this.digitalInvitesService.getInviteById(slugOrId);
        } else {
            invite = await this.digitalInvitesService.getInviteBySlug(slugOrId);
        }

        if (!invite) {
            throw new NotFoundException(`Digital invite was not found`);
        }
        return invite;
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a digital invite JSON payload' })
    async updateInvite(@Param('id') id: string, @Body() body: { inviteData: any }) {
        return this.digitalInvitesService.updateInvite(id, body.inviteData);
    }
}
