import { IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @IsNotEmpty()
  roleId: string;

  @IsNotEmpty()
  permissionIds: Array<string>;
}
