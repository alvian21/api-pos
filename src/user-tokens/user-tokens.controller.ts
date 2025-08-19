import { Controller, Get, Param } from '@nestjs/common';
import { UserTokensService } from './user-tokens.service';

@Controller('user-tokens')
export class UserTokensController {
  constructor(private readonly userTokensService: UserTokensService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userTokensService.findOne(id);
  }
}
