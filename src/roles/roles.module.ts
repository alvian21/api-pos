import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionsModule } from 'src/role-permissions/role-permissions.module';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolePermission } from 'src/role-permissions/entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission]), RolePermissionsModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule, RolesService],
})
export class RolesModule {}
