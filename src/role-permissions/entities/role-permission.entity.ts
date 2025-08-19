import { Permission } from 'src/permissions/entities/permissions.entity';
import { Role } from 'src/roles/entities/role.entity';
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RolePermission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Permission, (permission) => permission.rolePermission)
  permission: Permission;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  role: Role;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;
}
