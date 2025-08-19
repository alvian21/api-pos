import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Get, Param, UseGuards } from '@nestjs/common/decorators';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Permissions } from 'src/permissions/permissions.enum';
import { Permission } from 'src/permissions/permissions.decorator';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { RolePermissionsService } from './role-permissions.service';

@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private rolePermissionService: RolePermissionsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.RoleCreate)
  @Post()
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    try {
      this.rolePermissionService.create(createRolePermissionDto);
      return {
        rc: 200,
        message: 'Sukses menambahkan user',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  @Get('/role/:id')
  getByRole(@Param() param) {
    return this.rolePermissionService.getRolePermissions(param.id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.RoleCreate)
  @Post('/assign')
  assignPermissons(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.rolePermissionService.assignPermission(assignPermissionDto);
  }
}
