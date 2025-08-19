import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
  Delete,
  Response
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Permissions } from 'src/permissions/permissions.enum';
import { Permission } from 'src/permissions/permissions.decorator';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.RoleCreate)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Response() res) {
    return this.roleService.create(createRoleDto, res);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.RoleRead)
  @Get()
  findAll(@Request() req, @Response() res) {
    return this.roleService.findAll(req.user, req.query, res);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.RoleUpdate)
  @Patch(':id')
  update(@Param('id') id, @Body() updateRoleDto: UpdateRoleDto, @Response() res) {
    return this.roleService.update(id, updateRoleDto, res);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.RoleDelete)
  @Delete(':id')
  delete(@Param('id') id: string, @Response() res) {
    return this.roleService.remove(id, res);
  }
}
