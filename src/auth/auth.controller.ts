import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Response, CookieOptions } from 'express';
import { IJwtConfig, jwtConfig } from './../config/jwt.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigService: IJwtConfig,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(createAuthDto);
    this.authService.setAuthCookies(res, tokens);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(loginDto);

    this.setAuthCookies(res, tokens);
    const { password, refreshToken, ...result } = user;

    return result;
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.sub;

    await this.authService.logout(userId);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Вы успешно вышли из аккаунта' };
  }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: ms(this.jwtConfigService.accessExpiresIn),
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: ms(this.jwtConfigService.refreshExpiresIn),
    });
  }
}
