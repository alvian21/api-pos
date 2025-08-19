import {
  BadRequestException,
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
    const response = context.switchToHttp().getResponse();
    if (!user) {
      const email = context.getRequest().body.email;
      const password = context.getRequest().body.password;
      const errorMessage: string[] = [];
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

      !email && errorMessage.push('email should not be empty');
      !emailRegex.test(email) && errorMessage.push('email must be an email');
      !password && errorMessage.push('password should not be empty');

      if (errorMessage.length) {
        return this.baseService.sendError(response, 'error', errorMessage, HttpStatus.BAD_REQUEST);
      }

      return this.baseService.sendError(response, 'incorrect email or password', [], HttpStatus.UNAUTHORIZED);

    }

    if (!user.isActive) {
      return this.baseService.sendError(response, 'account is inactive, please check email for activation', [], HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
