import { UserRole } from '../users/entities/enums/users.enums';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  refreshToken?: string;
}

export interface IRequestWithUser extends Request {
  user: JwtPayload;
}
