import { IJwtConfig, jwtConfig } from './../config/jwt.config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from './../users/entities/user.entity';
import { Repository } from 'typeorm';
import { appConfig, IAppConfig } from './../config/app.config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { UserRole } from '../users/entities/enums/users.enums';
import { Skill } from '../skills/entities/skill.entity';
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
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
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
    // TODO: Закомментировано до реализации скиллов и категорий
    //
    // const skill = this.skillRepository.create({
    //   title: createAuthDto.skills.title,
    //   description: createAuthDto.skills.description,
    //   category: createAuthDto.skills.category,
    //   images: createAuthDto.skills.images,
    //   owner: user,
    // });

    // const category = await this.categoryRepository.findOne({
    //   where: { id: createAuthDto.wantToLearn.id },
    // });
    // if (!category) throw new BadRequestException('Category not found');

    // user.wantToLearn = [category];
    // user.skills = [skill];

    await this.userRepository.save(user);

    const tokens = this.generateTokens(user.id, user.email, user.role);
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);
    return {
      user,
      tokens,
    };
  }

  async refresh(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.jwtConfigService.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    const tokens = this.generateTokens(user.id, user.email, user.role);

    user.refreshToken = tokens.refreshToken;
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

    user.refreshToken = tokens.refreshToken;
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
