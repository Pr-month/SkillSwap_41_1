import { IJwtConfig, jwtConfig } from './../config/jwt.config';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from './../users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { appConfig, IAppConfig } from './../config/app.config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { UserRole } from '../users/entities/enums/users.enums';
import { Category } from '../categories/entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Response, CookieOptions } from 'express';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(appConfig.KEY)
    private readonly configService: IAppConfig,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigService: IJwtConfig,
    private readonly jwtService: JwtService,
  ) {}

  async register(createAuthDto: RegisterDto) {
    const user = this.userRepository.create({
      name: createAuthDto.name,
      email: createAuthDto.email,
      about: createAuthDto.about,
      birthdate: createAuthDto.birthday,
      city: createAuthDto.city,
      gender: createAuthDto.gender,
      avatar: createAuthDto.avatar,
      password: await bcrypt.hash(
        createAuthDto.password,
        this.configService.hashSalt,
      ),
      role: UserRole.USER,
    });

    if (createAuthDto.wantToLearn) {
      const categoryIds = createAuthDto.wantToLearn;
      const categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException(
          'One or more categories not found or invalid.',
        );
      }
      user.wantToLearn = categories;
    }

    await this.userRepository.save(user);

    const tokens = this.generateTokens(user.id, user.email, user.role);
    user.refreshToken = await bcrypt.hash(
      tokens.refreshToken,
      this.configService.hashSalt,
    );
    await this.userRepository.save(user);
    return {
      user,
      tokens,
    };
  }

  async refresh(userId: string, oldRefreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const isTokenValid = user?.refreshToken
      ? await bcrypt.compare(oldRefreshToken, user.refreshToken)
      : false;

    if (!user || !user.refreshToken || !isTokenValid) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    user.refreshToken = await bcrypt.hash(
      tokens.refreshToken,
      this.configService.hashSalt,
    );
    await this.userRepository.save(user);

    return { user, tokens };
  }

  async login(loginAuthDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginAuthDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    user.refreshToken = await bcrypt.hash(
      tokens.refreshToken,
      this.configService.hashSalt,
    );
    await this.userRepository.save(user);

    return { user, tokens };
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }

  public setAuthCookies(
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

  private generateTokens(userId: string, userMail: string, userRole: UserRole) {
    const payload: JwtPayload = {
      sub: userId,
      email: userMail,
      role: userRole,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.accessSecret,
        expiresIn: ms(this.jwtConfigService.accessExpiresIn),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.refreshSecret,
        expiresIn: ms(this.jwtConfigService.refreshExpiresIn),
      }),
    };
  }
}
