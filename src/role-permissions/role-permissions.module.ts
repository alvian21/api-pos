import { Module } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permissions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission, Role, Permission])],
  providers: [RolePermissionsService],
  controllers: [RolePermissionsController],
  exports: [TypeOrmModule, RolePermissionsService],
})
export class RolePermissionsModule {}
