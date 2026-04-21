import { UserRole } from '../users/entities/enums/users.enums';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface IRequestWithUser extends Request {
  user: JwtPayload;
}
