import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { UpdateUserStatusDto, InviteUserDto } from './dto/admin-users.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  async getAllUsers() {
    const users = await this.prisma.adminUser.findMany({
      include: {
        permissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Cleanse password field symmetrically before emitting
    return users.map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
  }

  async inviteUser(dto: InviteUserDto) {
    return this.adminAuthService.inviteSubAdmin(dto.email, dto.name, dto.permissions);
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Sub-admin not found');
    if (user.isSuper) throw new BadRequestException('Cannot suspend a master Super Admin');

    return this.prisma.adminUser.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, status: true, email: true },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Sub-admin not found');
    if (user.isSuper) throw new BadRequestException('Cannot delete a master Super Admin');

    // Permissions cascade is handled solidly by Prisma schema relations using ON DELETE CASCADE 
    await this.prisma.adminUser.delete({
      where: { id },
    });
    
    return { message: 'Sub-admin permanently deleted.' };
  }
}
