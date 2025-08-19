import { Role } from 'src/roles/entities/role.entity';
import { UserToken } from 'src/user-tokens/entities/user-token.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
@Unique('unique_email', ['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.user)
  role: Role;

  @OneToOne(() => UserToken, (userToken) => userToken.user)
  @JoinColumn()
  userToken: UserToken;
}
