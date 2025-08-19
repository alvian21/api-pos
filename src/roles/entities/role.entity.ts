import { type } from 'os';
import { Permission } from 'src/permissions/entities/permissions.entity';
import { RolePermission } from 'src/role-permissions/entities/role-permission.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
} from 'typeorm';

@Entity()
@Unique('unique_alias', ['alias'])
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alias: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @OneToMany(() => User, (user) => user.role)
  user: User[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];
}
