import { IJwtConfig, jwtConfig } from './../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SocketWithUser } from './notifications.type';
import { JwtPayload } from '../auth/auth.types';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: IJwtConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<SocketWithUser>();
    const token = client.handshake.query?.token as string;
    if (!token) {
      throw new WsException('Token is required');
    }
    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.jwtConf.accessSecret,
      });
      client.data.user = payload;
    } catch (error) {
      throw new WsException('Invalid token');
    }
    return true;
  }
}
