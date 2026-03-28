import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import {
  InviteSubAdminDto,
  SetupPasswordDto,
  AdminLoginDto,
} from './dto/admin-auth.dto';
import { AdminPermissionsGuard, RequireSuperAdmin } from './guards/rbac.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('invite')
  @UseGuards(AdminPermissionsGuard)
  @RequireSuperAdmin()
  async invite(@Body() dto: InviteSubAdminDto) {
    return this.adminAuthService.inviteSubAdmin(
      dto.email,
      dto.name,
      dto.permissions,
    );
  }

  @Post('setup-password')
  async setupPassword(@Body() dto: SetupPasswordDto) {
    return this.adminAuthService.setupPassword(dto.token, dto.newPassword);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto.email, dto.password);
  }
}
