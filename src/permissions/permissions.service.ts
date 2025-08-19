import { ConflictException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './entities/permissions.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) { }

  async create(createPermissionDto: CreatePermissionDto) {
    const newPermission = this.permissionRepository.create({
      alias: createPermissionDto.alias,
      name: createPermissionDto.name,
      isActive: createPermissionDto.isActive,
    });
    try {
      return await newPermission.save();
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException({
          statusCode: 409,
          message: 'alias already used',
        });
      }
    }
  }

  async findAll(auhtUser) {
    const permissions = await this.permissionRepository.find({
      order: {
        alias: 'ASC',
      },
    });

    const groupedPermission = {};
    permissions.map((x) => {
      const group = x.alias.split('.')[0];
      if (!groupedPermission[group]) {
        groupedPermission[group] = [];
      }

      const { createdAt, updatedAt, ...result } = x;
      groupedPermission[group].push(result);
    });

    return groupedPermission;
  }
}
