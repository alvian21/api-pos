import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionsService } from 'src/role-permissions/role-permissions.service';
import { Permissions } from './permissions.enum';
import { PERMISSION_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private relflector: Reflector,
    private rolePermissionService: RolePermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.relflector.getAllAndOverride<Permissions[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const role = request.user.role;
    const permissions = await Promise.resolve(
      this.rolePermissionService.getRolePermissions(role, 'guard'),
    );

    return requiredPermission.some((permission) =>
      permissions?.includes(permission),
    );
  }
}
