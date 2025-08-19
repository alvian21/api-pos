import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { HashModule } from 'src/hash/hash.module';
import { RolePermissionsModule } from 'src/role-permissions/role-permissions.module';
import { RolesModule } from 'src/roles/roles.module';
import { UserToken } from 'src/user-tokens/entities/user-token.entity';
import { CryptoModule } from 'src/utils/crypto/crypto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserToken]),
    HashModule,
    RolePermissionsModule,
    RolesModule,
    CryptoModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
