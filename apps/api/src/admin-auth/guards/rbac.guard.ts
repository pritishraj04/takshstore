import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const RequirePermission = (
  moduleName: string,
  level: 'READ' | 'WRITE',
) => SetMetadata('admin_permission', { moduleName, level });

export const RequireSuperAdmin = () => SetMetadata('admin_super_only', true);

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    let user;
    try {
      user = this.jwtService.verify(token, {
        secret:
          process.env.ADMIN_JWT_SECRET || 'tmp_dev_secret_change_me_in_prod',
      });
    } catch (e) {
      throw new ForbiddenException('Invalid or expired token');
    }

    if (user.type !== 'SESSION') {
      throw new ForbiddenException('Invalid token type');
    }

    request.adminUser = user;

    if (user.isSuper === true) {
      return true;
    }

    // Check super admin guard
    const isSuperOnly = this.reflector.get<boolean>(
      'admin_super_only',
      context.getHandler(),
    );
    if (isSuperOnly && !user.isSuper) {
      throw new ForbiddenException('Super Admin access required');
    }

    // Check specific module permissions
    const requiredPermission = this.reflector.get<{
      moduleName: string;
      level: 'READ' | 'WRITE';
    }>('admin_permission', context.getHandler());

    if (!requiredPermission && !isSuperOnly) {
      // If no permission decorator is used and not super admin only, it passes authentication
      return true;
    }

    if (requiredPermission) {
      const { moduleName, level } = requiredPermission;
      const userPermissions = user.permissions || {};
      const userLevel = userPermissions[moduleName] || 'NONE';

      if (userLevel === 'NONE') {
        throw new ForbiddenException(
          `Missing permission for module: ${moduleName}`,
        );
      }

      if (level === 'WRITE' && userLevel !== 'WRITE') {
        throw new ForbiddenException(
          `WRITE permission required for module: ${moduleName}`,
        );
      }
    }

    return true;
  }
}
