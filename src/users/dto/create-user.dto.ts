import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({ minSymbols: 0 })
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  nickname: string;

  @IsNotEmpty()
  roleId: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
