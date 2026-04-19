import { IJwtConfig, jwtConfig } from './../config/jwt.config';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { appConfig, IAppConfig } from './../config/app.config';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly configService: IAppConfig,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigService: IJwtConfig,
  ) {}
  async register(createAuthDto: CreateAuthDto) {
    const userExists = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await bcrypt.hash(
      createAuthDto.password,
      this.configService.salt,
    );
    const user = this.userRepository.create({
      ...createAuthDto,
      password: hash,
    });
    const tokens = await this.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);
    return {
      user,
      tokens,
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  /*  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  } */

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.accessSecret,
        expiresIn: ms(this.jwtConfigService.accessExpiresIn as StringValue),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.refreshSecret,
        expiresIn: ms(this.jwtConfigService.refreshExpiresIn as StringValue),
      }),
    };
  }
}
