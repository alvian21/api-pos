import { RolePermission } from 'src/role-permissions/entities/role-permission.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique('unique_alias_permission', ['alias'])
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  alias: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isForAll: boolean;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermission: RolePermission[];
}
