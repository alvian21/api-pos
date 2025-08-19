import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  alias: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
