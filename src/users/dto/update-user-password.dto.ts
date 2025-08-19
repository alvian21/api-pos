import { IsStrongPassword } from 'class-validator';

export class UpdateUserPasswordDto {
  oldPassword: string;

  @IsStrongPassword({ minSymbols: 0 })
  newPassword: string;
}
