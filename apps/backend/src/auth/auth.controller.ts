import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/user.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { user_id: number; refresh_token: string }) {
    if (!body.refresh_token || !body.user_id) {
      throw new UnauthorizedException('user_id dan refresh_token diperlukan');
    }
    return this.authService.refreshToken(body.user_id, body.refresh_token);
  }

  @Post('logout')
  async logout(@CurrentUser() user: { id: number }) {
    await this.authService.logout(user.id);
    return { message: 'Logout berhasil' };
  }

  @Get('me')
  async me(@CurrentUser() user: { id: number }) {
    return this.authService.getProfile(user.id);
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: { id: number },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }
}
