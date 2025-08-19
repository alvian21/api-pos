import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { HashModule } from 'src/hash/hash.module';
import { RolePermissionsModule } from 'src/role-permissions/role-permissions.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { RolesModule } from 'src/roles/roles.module';
import { CryptoModule } from 'src/utils/crypto/crypto.module';
import { UserTokensModule } from 'src/user-tokens/user-tokens.module';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToken } from 'src/user-tokens/entities/user-token.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseModule } from 'src/utils/base/base.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserToken]),
    // ThrottlerModule.forRoot([{
    //   limit: 10,
    //   ttl: 60 // milisecond
    // }]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' }, // access expire
    }),
    HashModule,
    RolePermissionsModule,
    RolesModule,
    UserTokensModule,
    CryptoModule,
    BaseModule
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard
    // }
  ],
  exports: [AuthService, PassportModule, JwtModule],
  controllers: [AuthController],
})
export class AuthModule { }
