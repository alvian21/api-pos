import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permissions.entity';
import { Role } from 'src/roles/entities/role.entity';
import { In, Not, Repository } from 'typeorm';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) { }

  async create(rolePermission: CreateRolePermissionDto) {
    const newRolePermission = this.rolePermissionRepository.create({
      role: { id: rolePermission.roleId },
      permission: { id: rolePermission.permissionId },
    });

    return await newRolePermission.save();
  }

  async assignPermission(assignPermissionDto: AssignPermissionDto) {
    const permissionIds = assignPermissionDto.permissionIds;
    const roleId = assignPermissionDto.roleId;

    await this.rolePermissionRepository.delete({
      role: { id: roleId },
      permission: { id: Not(In(permissionIds)) },
    });

    for (const permissionId of permissionIds) {
      const isExist = await this.rolePermissionRepository.findOne({
        where: {
          role: { id: roleId },
          permission: { id: permissionId },
        },
      });

      if (!isExist) {
        try {
          await this.rolePermissionRepository
            .create({
              role: { id: roleId },
              permission: { id: permissionId },
            })
            .save();
        } catch (error) {
          console.error(error);
          if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new BadRequestException({
              statusCode: 400,
              message: `${error.sqlMessage.split('KEY (`').pop().split('`)')[0]
                } not found`,
            });
          }
        }
      }
    }

    return await this.getRolePermissions(roleId);
  }

  async getRolePermissions(roleId: string, usage = 'api'): Promise<any> {
    const permissions = await this.rolePermissionRepository.find({
      where: { role: { id: roleId } },
      relations: ['permission'],
      select: { permission: { id: true, alias: true, name: true } },
      order: {
        permission: {
          alias: 'ASC',
        },
      },
    });

    if (usage === 'api') {
      const groupedPermission = {};
      permissions.map((x, index) => {
        const group = x.permission.alias.split('.')[0];
        if (!groupedPermission[group]) {
          groupedPermission[group] = [];
        }
        groupedPermission[group].push(x.permission);
      });

      return groupedPermission;
    } else if (usage === 'guard') {
      return permissions.map((x) => {
        return x.permission.alias;
      });
    } else {
      return permissions;
    }
  }
}
