import { IsEmail, IsNotEmpty, IsStrongPassword, IsUrl } from 'class-validator';

export class RegisterAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  fullName: string;

  nickname: string;

  @IsStrongPassword({ minSymbols: 0 })
  password: string;

  @IsNotEmpty()
  @IsUrl()
  verifyUrl: string;
}
