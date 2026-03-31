import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';

@Controller('admin/tags')
@UseGuards(AdminPermissionsGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Get()
    @RequirePermission('tags', 'READ')
    findAll() {
        return this.tagsService.findAll();
    }

    @Get(':id')
    @RequirePermission('tags', 'READ')
    findOne(@Param('id') id: string) {
        return this.tagsService.findOne(id);
    }

    @Post()
    @RequirePermission('tags', 'WRITE')
    create(@Body() data: { name: string, slug: string }) {
        return this.tagsService.create(data);
    }

    @Patch(':id')
    @RequirePermission('tags', 'WRITE')
    update(@Param('id') id: string, @Body() data: { name?: string, slug?: string }) {
        return this.tagsService.update(id, data);
    }

    @Delete(':id')
    @RequirePermission('tags', 'WRITE')
    remove(@Param('id') id: string) {
        return this.tagsService.remove(id);
    }
}
