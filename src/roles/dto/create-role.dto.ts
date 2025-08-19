import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  alias: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
