import { SetMetadata } from '@nestjs/common';
import { Permissions } from './permissions.enum';

export const PERMISSION_KEY = 'permissions';
export const Permission = (...permissions: Permissions[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
