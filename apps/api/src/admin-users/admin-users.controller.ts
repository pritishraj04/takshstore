import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { InviteUserDto, UpdateUserStatusDto } from './dto/admin-users.dto';
import {
  AdminPermissionsGuard,
  RequireSuperAdmin,
} from '../admin-auth/guards/rbac.guard';

@Controller('admin/users')
@UseGuards(AdminPermissionsGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    const adminId = req.adminUser.sub || req.adminUser.id;
    return this.adminUsersService.getMe(adminId);
  }

  @Get()
  @RequireSuperAdmin()
  async getAllUsers() {
    return this.adminUsersService.getAllUsers();
  }

  @Post('invite')
  @RequireSuperAdmin()
  async inviteUser(@Body() dto: InviteUserDto) {
    return this.adminUsersService.inviteUser(dto);
  }

  @Patch(':id/status')
  @RequireSuperAdmin()
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateStatus(id, dto);
  }

  @Delete(':id')
  @RequireSuperAdmin()
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }

  @Patch('me/alerts')
  // No RequireSuperAdmin decorator here because user is updating themselves
  async toggleAlerts(@Req() req: any, @Body('receives') receives: boolean) {
    const adminId = req.adminUser.sub || req.adminUser.id;
    return this.adminUsersService.toggleContactAlerts(adminId, receives);
  }
}
