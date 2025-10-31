import { Controller, Post, Body, UseGuards, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  public async login(@Body() input: LoginDto) {
    const user = await this.authService.validateUser(input.username, input.password);
    const { accessToken, refreshToken } = await this.authService.generateTokensByUser(user);
  
  
    // TODO: use custom interceptor to serialize the user response 
    return { 
      accessToken, 
      refreshToken, 
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: false })
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  public async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.updateTokensByRefreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string | undefined, @Req() req: any) {
    return await this.authService.logout(req.user.id, refreshToken);
  }
}
