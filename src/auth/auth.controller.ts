import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response } from 'express';
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
}
