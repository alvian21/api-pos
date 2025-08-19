import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  Body,
  Query,
  Response
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { RegisterAuthDto } from './dto/register-auth.dto';

// @SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Response() res) {
    return this.authService.login(req.user, res);
  }

  // @Post('/register')
  // async register(@Body() user: RegisterAuthDto) {
  //   return this.authService.register(user);
  // }

  // @Post('/activate')
  // async activate(@Body() body) {
  //   return this.authService.activate(body.token, body.verifyUrl);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/permissions')
  async authPermissions(@Request() req, @Response() res) {
    const roleId = req.user.role;

    return await this.authService.getAuthPermissions(roleId, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async authDetail(@Request() req, @Response() res) {
    const user = req.user;

    return await this.authService.getAuthDetail(user, res);
  }

  // @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refresh(@Request() req,  @Response() res) {
    // const userId = req.user?.id;
    // const refreshToken = req.user?.refreshToken;
    return this.authService.refreshTokenManual(req.body.refresh_token, res);
  }
}
