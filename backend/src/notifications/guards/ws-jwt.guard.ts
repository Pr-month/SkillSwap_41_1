import { IJwtConfig, jwtConfig } from '../../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../auth/auth.types';
import { WsException } from '@nestjs/websockets';
import { SocketWithUser } from '../notifications.type';

@Injectable()
export class WsJwtService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: IJwtConfig,
  ) {}

  validate(client: SocketWithUser): JwtPayload | null {
    const token = client.handshake.query?.token as string;
    if (!token) {
      throw new WsException('Token is required');
    }
    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.jwtConf.accessSecret,
      });
      return payload;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }
}
