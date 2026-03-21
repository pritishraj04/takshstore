import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { InviteUserDto, UpdateUserStatusDto } from './dto/admin-users.dto';
import { AdminPermissionsGuard, RequireSuperAdmin } from '../admin-auth/guards/rbac.guard';

@Controller('admin/users')
@UseGuards(AdminPermissionsGuard)
@RequireSuperAdmin() // Restrict absolute team creation entirely explicitly to the Root Owner role
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers() {
    return this.adminUsersService.getAllUsers();
  }

  @Post('invite')
  async inviteUser(@Body() dto: InviteUserDto) {
    return this.adminUsersService.inviteUser(dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminUsersService.updateStatus(id, dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }
}
