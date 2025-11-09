import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
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
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
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
