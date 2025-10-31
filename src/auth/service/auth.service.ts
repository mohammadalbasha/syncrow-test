import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../repository/user.model';
import { RefreshToken } from '../repository/refresh-token.model';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtConfig } from 'src/config/config.interface';
import { comparePassword, hashPassword } from '../utils/password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly            userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,    
    private readonly configService: ConfigService,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.validatePassword(
        user,
        password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
    return user;
  }

  async generateTokensByUser(user: User) {
    const jwtConfig = this.configService.get<JwtConfig>('jwt');
    const payload = {
      sub: user.id,
      username: user.username,
    };

    
    // Generate access token JWT
    const accessToken = await this.jwtService.signAsync(
      payload,
      {
        expiresIn: jwtConfig!.accessTokenExpiresIn,
      },
    );

    const refreshToken = this.jwtService.sign(
      payload,
      {
        expiresIn: jwtConfig!.refreshTokenExpiresIn,
      },
    );

   
    await this.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateTokensByRefreshToken(refreshToken: string) {
    const tokenInstance = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
    if (!tokenInstance || !tokenInstance.user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const tokens = await this.generateTokensByUser(tokenInstance.user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokenInstance.user,
    };
  }

  async logout(userId: number, refreshToken?: string) {
    if (!refreshToken) {
      await this.clearRefreshToken(userId);
      return true;
    }
    const deleteResult = await this.refreshTokenRepository.delete({
      user_id: userId,
      token: refreshToken,
    });
    if (deleteResult.affected === 0) {
      throw new BadRequestException('Refresh token does not exist');
    }
    return true;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const tokenInstance = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
    return tokenInstance?.user || null;
  }

  async createRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      token,
      expiresAt,
      user_id: userId,
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    await this.clearRefreshToken(userId);
    await this.createRefreshToken(userId, refreshToken, new Date(Date.now() + this.configService.get<JwtConfig>('jwt')!.refreshTokenExpiresIn));
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ user_id: userId });
  }
  
  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) {
      return false; 
    }
    console.log('user.password', user.password, password, await hashPassword(password));
    return await comparePassword(password, user.password);
  }


}

