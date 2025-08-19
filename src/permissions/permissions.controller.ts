import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Permissions } from './permissions.enum';
import { Permission } from 'src/permissions/permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private permissionService: PermissionsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.PermissionCreate)
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.PermissionRead)
  @Get()
  async getAll(@Request() req) {
    const authUser = req.user;
    return this.permissionService.findAll(authUser);
  }
}
