import {
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { BaseService } from 'src/utils/base/base.service';
import { Response } from 'express';

@Injectable()
export class RolesService extends BaseService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {
    super();
  }

  async create(role: CreateRoleDto, res: Response) {

    const checkRole = await this.roleRepository.findOne({
      where: {
        alias: ILike(role.alias)
      }
    });

    if (checkRole) {
      return this.sendError(res, 'Role already exists', [], HttpStatus.CONFLICT);
    }

    const newRole = this.roleRepository.create({
      alias: role.alias,
      name: role.name,
      isActive: role.isActive,
    });

    try {
      const created = await newRole.save();

      return this.sendResponse(res, created, "Role Saved");
    } catch (error) {
      return this.sendError(res, error?.message, [], error?.statusCode || error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(
    authUser: any,
    { skip, take, search, orderBy = 'createdAt', order = 'DESC' },
    res: Response
  ) {
    const [data, count] = await this.roleRepository.findAndCount({
      where: { name: search ? ILike(`%${search}%`) : undefined },
      skip: skip,
      take: take,
      order: {
        [orderBy]: order,
      },
    });
    return this.sendResponse(res, { data, count }, "Retrieve Data");
  }

  async findOne(id: string, res: Response) {
    const role = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!role) {
      return this.sendError(res, 'Role Not Found', [], HttpStatus.NOT_FOUND);
    }
    return this.sendResponse(res, role, "Retrieve Data");
  }

  async findByAlias(alias: string) {
    return await this.roleRepository.findOne({
      where: { alias: alias },
    });
  }

  async update(id: string, role: UpdateRoleDto, res: Response) {

    const roleData = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!roleData) {
      return this.sendError(res, 'Role Not Found', [], HttpStatus.NOT_FOUND);
    }

    const checkRole = await this.roleRepository.findOne({
      where: {
        alias: ILike(role.alias), 
        id: Not(id)
      }
    });

    if (checkRole) {
      return this.sendError(res, 'Role already exists', [], HttpStatus.CONFLICT);
    }

    try {
      const updated = await this.roleRepository.update(id, role);
      if (updated.affected === 0) {
        throw new NotFoundException();
      }
      return this.sendResponse(res, updated, "Role Updated");
    } catch (error) {
      return this.sendError(res, error?.message, [], error?.statusCode || error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string, res: Response) {
    const roleData = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!roleData) {
      return this.sendError(res, 'Role Not Found', [], HttpStatus.NOT_FOUND);
    }

    const deleted = await this.roleRepository.delete(id);
    if (deleted.affected === 0) {
      throw new NotFoundException();
    }
    return this.sendResponse(res, deleted, "Role Deleted");
  }
}
