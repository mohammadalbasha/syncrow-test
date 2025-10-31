import { Entity, Column } from 'typeorm';
import { BaseModel } from 'src/shared/models/model.base';

export enum UserRole {
  user = 'user',
  admin = 'admin',
}

@Entity({ name: 'users' })
export class User extends BaseModel {
  @Column({ type: 'varchar', nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.user })
  role: UserRole;
}
