import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  HttpStatus
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HashService } from 'src/hash/hash.service';
import { Role } from 'src/roles/entities/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { AuthUser } from 'src/auth/auth.interface';
import { UserToken } from 'src/user-tokens/entities/user-token.entity';
import { CryptoService } from 'src/utils/crypto/crypto.service';
import { BaseService } from 'src/utils/base/base.service';
import { Response } from 'express';

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
    private hashService: HashService,
    private cryptoService: CryptoService,
  ) {
    super();
  }

  async create(authUser, createUserDto: CreateUserDto, res: Response): Promise<any> {
    const role = new Role();
    role.id = createUserDto.roleId;

    const checkEmail = await this.userRepository.findOne({
      where: {
        email: ILike(createUserDto.email)
      }
    });

    if(checkEmail){
      return this.sendError(res, 'Email already exists', [], HttpStatus.CONFLICT);
    }

    const newUser = this.userRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      nickname: createUserDto.nickname || createUserDto.fullName.split(' ')[0],
      isActive: createUserDto.isActive,
      password: await this.hashService.getHash(createUserDto.password),
      role: role,
    });

    try {
      const { password, createdAt, updatedAt, ...created } = await newUser.save();
      return this.sendResponse(res, created, "User Saved");
    } catch (error) {
      return this.sendError(res, error?.message, [], error?.statusCode || error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(
    authUser: any,
    {
      skip,
      take,
      search,
      orderBy = 'createdAt',
      order = 'DESC',
      role = '',
    },
    res: Response
  ) {
    const [data, count] = await this.userRepository.findAndCount({
      where:
        search || role
          ? [
            {
              fullName: search ? ILike(`%${search}%`) : undefined,
              role: role ? { alias: ILike(role) } : undefined,
            },
            {
              email: search ? ILike(`%${search}%`) : undefined,
              role: role ? { alias: ILike(role) } : undefined,
            },
          ]
          : undefined,
      relations: {
        role: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        nickname: true,
        isActive: true,
        image: true,
        createdAt: true as any,
        updatedAt: true as any,
        role: {
          id: true,
          alias: true,
          name: true,
        },
      },
      skip: skip,
      take: take,
      order: {
        [orderBy]: order,
      },
    });

    const formatted = data.map((el) => {
      const { role, ...user } = el;
      return {
        ...user,
        role,
      };
    });

    return this.sendResponse(res, { data: formatted, count }, "Retrieve Data");
  }

  async findOne(email: string) {
    return await this.userRepository.findOne({
      where: { email: email },
      relations: ['role'],
    });
  }

  async findById(authUser: AuthUser, id: string, res: Response) {
    if (authUser.roleAlias !== 'admin' && authUser.id !== id) {
      return this.sendError(res, 'FORBIDDEN', [], HttpStatus.FORBIDDEN);
    }

    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: {
        role: true,
      },
      select: {
        role: {
          id: true,
          alias: true,
          name: true,
        },
      },
    });

    if (!user) {
      return this.sendError(res, 'User Not Found', [], HttpStatus.NOT_FOUND);
    }

    const { password, role, ...foundUser } = user;

    return this.sendResponse(res, { ...foundUser, role }, "Retrieve Data");
  }

  async findByColumn(options: {
    where: FindOptionsWhere<User>;
    relations?: string[];
  }) {
    const user = await this.userRepository.findOne({
      where: options.where,
      relations: options.relations,
    });

    if (!user) {
      throw new NotFoundException();
    }
    const { password, ...formattedUser } = user;
    return formattedUser;
  }

  async update(
    authUser: AuthUser,
    userId: string,
    updateUserDto: UpdateUserDto,
    res: Response
  ): Promise<any> {
    if (authUser.roleAlias !== 'admin' && authUser.id !== userId) {
      throw new ForbiddenException();
    }

    const { password, roleId, verifyUrl, ...updateDto } = updateUserDto;

    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      return this.sendError(res, 'User Not Found', [], HttpStatus.NOT_FOUND);
    }

    const isEmailChanged = updateDto.email && updateDto.email !== user.email;
    if (isEmailChanged) {
      if (!verifyUrl) {
        return this.sendError(res, 'verifyUrl should not be empty when email change is requested', [], HttpStatus.BAD_REQUEST);
      }
      // change isActive to false in production
      updateDto.isActive = true;
    }

    try {
      const updated = await this.userRepository.update(userId, {
        ...updateDto,
        role: roleId ? { id: roleId } : undefined,
      });

      return this.sendResponse(res, updated, "User Updated");
      
    } catch (error) {

      return this.sendError(res, error?.message, [], error?.statusCode || error?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePassword(
    authUser: AuthUser,
    id: string,
    { oldPassword, newPassword }: UpdateUserPasswordDto,
    res: Response
  ) {
    if (authUser.roleAlias !== 'admin' && authUser.id !== id) {
      return this.sendError(res, 'FORBIDDEN', [], HttpStatus.FORBIDDEN);
    }

    const user = await this.userRepository.findOneBy({
      id: id,
    });
    if (!user) {
      return this.sendError(res, 'User Not found', [], HttpStatus.NOT_FOUND);
    }

    if (authUser.roleAlias !== 'admin') {
      if (!oldPassword) {
        return this.sendError(res, 'oldPassword should not be empty', [], HttpStatus.BAD_REQUEST);
      }

      const isMatch = await this.hashService.isMatch(
        oldPassword,
        user.password,
      );
      if (!isMatch) {

        return this.sendError(res, 'invalid oldPassword, instead use /password-reset if forgot oldPassword', [], HttpStatus.BAD_REQUEST);
      }
    }

    this.userRepository.update(id, {
      password: await this.hashService.getHash(newPassword),
    });

    return this.sendResponse(res, null, "password updated");

  }

  async changePassword(id: string, newPassword: string) {
    return await this.userRepository.update(id, {
      password: await this.hashService.getHash(newPassword),
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
