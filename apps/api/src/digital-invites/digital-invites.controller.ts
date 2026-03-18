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

    @Get('draft/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a draft digital invite by its database ID for the Customizer editor' })
    @ApiResponse({ status: 200, description: 'Return the digital invite.' })
    @ApiResponse({ status: 404, description: 'Invite not found or unauthorized.' })
    async getDraft(@Param('id') id: string, @Request() req) {
        const userId = req.user?.sub || req.user?.userId;
        const invite = await this.digitalInvitesService.getInviteById(id, userId);
        return invite;
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get a digital invite by its custom slug for public viewing' })
    @ApiResponse({ status: 200, description: 'Return the digital invite.' })
    @ApiResponse({ status: 404, description: 'Invite not found.' })
    async getInvite(@Param('slug') slug: string) {
        const invite = await this.digitalInvitesService.getInviteBySlug(slug);

        if (!invite) {
            throw new NotFoundException(`Digital invite was not found`);
        }
        return invite;
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a digital invite JSON payload' })
    async updateInvite(@Param('id') id: string, @Body() body: { inviteData: any, status?: any }, @Request() req) {
        const userId = req.user?.sub || req.user?.userId;
        return this.digitalInvitesService.updateInvite(id, userId, body.inviteData, body.status);
    }
}
