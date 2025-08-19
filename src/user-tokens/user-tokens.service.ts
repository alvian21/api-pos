import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToken } from './entities/user-token.entity';
import { Repository } from 'typeorm';
import { UpsertUserTokenDto } from './dto/upsert-user-token.dto';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
  ) { }

  async upsert(upsertUserTokenDto: UpsertUserTokenDto) {
    const {
      userId,
      refreshToken = undefined,
      activationToken = undefined,
    } = upsertUserTokenDto;

    const updated = await this.userTokenRepository
      .upsert({ user: { id: userId }, refreshToken, activationToken }, [
        'user.id',
      ])
      .catch(async (error) => {
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException({
            statusCode: 409,
            message: 'user token already exist',
          });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          throw new BadRequestException({
            statusCode: 400,
            message: `${error.sqlMessage.split('KEY (`').pop().split('`)')[0]
              } not found`,
          });
        }
      });

    return updated;
  }

  async findOne(id: string) {
    const token = this.userTokenRepository.findOne({
      where: { id: id },
    });

    if (!token) {
      throw new NotFoundException();
    }
    return token;
  }
}
