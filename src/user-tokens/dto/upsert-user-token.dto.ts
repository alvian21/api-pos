import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpsertUserTokenDto {
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  refreshToken?: string;

  @IsOptional()
  activationToken?: string;
}
