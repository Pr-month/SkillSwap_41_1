import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

export const cookieExtractor = (cookieName: string): JwtFromRequestFunction => {
  return (req: Request): string | null => {
    if (req?.cookies && typeof req.cookies[cookieName] === 'string') {
      return req.cookies[cookieName];
    }
    return null;
  };
};
