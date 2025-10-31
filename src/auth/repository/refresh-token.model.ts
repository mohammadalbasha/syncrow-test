import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from 'src/shared/models/model.base';
import { User } from './user.model';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends BaseModel {
  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
