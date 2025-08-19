import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionsModule } from 'src/role-permissions/role-permissions.module';
import { Permission } from './entities/permissions.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), RolePermissionsModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
