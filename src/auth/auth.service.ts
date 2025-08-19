import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/hash/hash.service';
import { RolePermissionsService } from 'src/role-permissions/role-permissions.service';
import { RolesService } from 'src/roles/roles.service';
import { CryptoService } from 'src/utils/crypto/crypto.service';
import { UserTokensService } from 'src/user-tokens/user-tokens.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToken } from 'src/user-tokens/entities/user-token.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseService } from 'src/utils/base/base.service';
import { Response } from 'express';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
    private rolePermissionsService: RolePermissionsService,
    private rolesService: RolesService,
    private userTokensService: UserTokensService,
    private cryptoService: CryptoService,
  ) {
    super();
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) return null;
    const passMatch = await this.hashService.isMatch(pass, user.password);
    if (user && passMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, res: Response) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role?.id,
      roleAlias: user.role?.alias,
    };
    const role = user.role?.name;
    const fullName = user.fullName;
    const nickname = user.nickname;

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { id: payload.id, email: payload.email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '14d', // refresh expire
        },
      ),
    ]);

    this.userTokenRepository.upsert(
      { user: { id: payload.id }, refreshToken: refresh_token },
      ['user.id'],
    );

    const data = {
      access_token,
      refresh_token,
      fullName,
      nickname,
      role,
    };

    return this.sendResponse(res, data, 'Login Success');
  }

  // async activate(token: string, verifyUrl: string) {
  //   const errorMessage: string[] = [];
  //   if (!token) {
  //     errorMessage.push('token should not be empty');
  //   }
  //   if (!verifyUrl) {
  //     errorMessage.push('verifyUrl should not be empty');
  //   }
  //   if (errorMessage.length) {
  //     throw new BadRequestException(errorMessage);
  //   }

  //   const { userToken, ...user } = await this.usersService
  //     .findByColumn({
  //       where: { userToken: { activationToken: token } },
  //       relations: ['userToken'],
  //     })
  //     .catch(() => {
  //       throw new BadRequestException('token salah atau kadaluwarsa');
  //     });

  //   const oneDay = 60 * 60 * 24 * 1000;
  //   const expiration = userToken.updatedAt.getTime() + oneDay;

  //   if (Date.now() > expiration) {
  //     const token = this.cryptoService.generateRandom();
  //     this.userTokenRepository.update(userToken.id, { activationToken: token });

  //     this.mailService.sendActivationEmail(
  //       { email: user.email, name: user.fullName },
  //       token,
  //       verifyUrl,
  //     );
  //     throw new BadRequestException('token salah atau kadaluwarsa');
  //   }

  //   this.userRepository.update(user.id, { isActive: true });
  //   this.userTokensService.upsert({
  //     userId: user.id,
  //     activationToken: undefined,
  //   });

  //   return { message: 'aktivasi akun berhasil' };
  // }

  async getAuthDetail(authUser, res: Response) {
    const user = await this.usersService.findByColumn({
      where: { id: authUser.id },
      relations: ['role'],
    });

    return this.sendResponse(
      res,
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        nickname: user.nickname,
        image: user.image,
        role: user.role.name,
      },
      'Retrieve Data',
    );
  }

  async getAuthPermissions(roleId: string, res: Response) {
    const permission = await this.rolePermissionsService.getRolePermissions(
      roleId,
      'api',
    );

    return this.sendResponse(res, permission, 'Retrieve Data');
  }

  async refreshToken(userId: string, refreshToken: string, res: Response) {
    const token = await this.userTokenRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: {
        user: {
          role: true,
        },
      },
    });

    if (!token || !token.refreshToken) {
      return this.sendError(res, 'Access Denied', [], HttpStatus.UNAUTHORIZED);
    }
    const refreshTokenMatches = token.refreshToken === refreshToken;
    if (!refreshTokenMatches)
      return this.sendError(res, 'Access Denied', [], HttpStatus.UNAUTHORIZED);

    const payload = {
      id: token.user.id,
      email: token.user.email,
      role: token.user.role?.id,
      roleAlias: token.user.role?.alias,
    };
    const access_token = this.jwtService.signAsync(payload);
    const refresh_token = this.jwtService
      .signAsync(
        { id: token.user.id },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      )
      .then((res) => {
        this.userTokensService.upsert({
          userId: token.user.id,
          refreshToken: res,
        });
        return res;
      });

    return {
      access_token: await access_token,
      refresh_token: await refresh_token,
      fullName: token.user.fullName,
      nickname: token.user.nickname,
      role: token.user.role.name,
    };
  }

  async refreshTokenManual(token: string, res: Response) {
    const payload = await this.jwtService
      .verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      })
      .catch(() => {
        return this.sendError(res, 'UNAUTHORIZED', [], HttpStatus.UNAUTHORIZED);
      });

    try {
      const refreshToken = await this.refreshToken(payload.id, token, res);
      return this.sendResponse(res, refreshToken, 'Refresh Success');
    } catch (error) {
      return this.sendError(
        res,
        error?.message || 'UNAUTHORIZED',
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
