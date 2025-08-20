import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseService } from 'src/utils/base/base.service';
import { Response } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {

  constructor(
    private readonly baseService: BaseService
  ) {
    super()
  }

  handleRequest(err, user, info, context) {
    if (!user) {
      const req = context.switchToHttp().getRequest();
      const email = req.body.email;
      const password = req.body.password;
      const errorMessage: string[] = [];
  
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
  
      if (!email) errorMessage.push('email should not be empty');
      if (email && !emailRegex.test(email)) errorMessage.push('email must be an email');
      if (!password) errorMessage.push('password should not be empty');
  
      if (errorMessage.length) {
        throw new HttpException(
          { status: HttpStatus.BAD_REQUEST, message: 'error', errors: errorMessage },
          HttpStatus.BAD_REQUEST,
        );
      }
  
      throw new UnauthorizedException('incorrect email or password');
    }
  
    if (!user.isActive) {
      throw new UnauthorizedException('account is inactive, please check email for activation');
    }
  
    // ⚡ Jangan pakai res.json di sini!
    return user;
  }
  
}
