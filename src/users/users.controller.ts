import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
  Patch,
  Response
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Permission } from 'src/permissions/permissions.decorator';
import { Permissions } from 'src/permissions/permissions.enum';
import { PermissionsGuard } from 'src/permissions/permissions.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.UserCreate)
  @Post()
  async create(@Request() req, @Body() createUserDto: CreateUserDto, @Response() res) {
    return await this.userService.create(req.user, createUserDto, res);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permission(Permissions.UserRead)
  @Get()
  findAll(@Request() req: any, @Response() res): Promise<any> {
    return this.userService.findAll(req.user, req.query, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param() params, @Response() res) {
    const authUser = req.user;
    return this.userService.findById(authUser, params.id, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param() params,
    @Body() updatedUser: UpdateUserDto,
    @Response() res
  ) {
    return await this.userService.update(req.user, params.id, updatedUser, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/password')
  async updatePassword(
    @Request() req,
    @Param() params,
    @Body() updatedUserPasswordDto: UpdateUserPasswordDto,
    @Response() res
  ) {
    return await this.userService.updatePassword(
      req.user,
      params.id,
      updatedUserPasswordDto,
      res
    );
  }
}
