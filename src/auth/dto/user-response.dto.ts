import { Exclude } from 'class-transformer';
import { User, UserRole } from '../repository/user.model';

export class UserResponseDto {
  id: number;
  username: string;
  role: UserRole;

  @Exclude()
  password: string;
}
