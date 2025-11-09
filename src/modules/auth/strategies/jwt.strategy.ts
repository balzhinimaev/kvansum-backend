import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthenticatedUser } from '../../../common/types/authenticated-user';
import { UserRole } from '../../../common/schemas';

type JwtPayload = {
  sub: string;
  telegramId?: number;
  username?: string;
  role: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-for-development',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('JWT payload does not contain subject');
    }

    // Passport will build a user object based on the return value of our validate() method,
    // and attach it as a property on the Request object.
    return { 
      userId: payload.sub, 
      telegramId: payload.telegramId,
      username: payload.username,
      role: payload.role,
    };
  }
}
