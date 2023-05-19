import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/providers/users.service';

const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private readonly config: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // If the route handler has been marked as public, no further evaluation is needed.
      return true;
    }

    const req = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      throw new UnauthorizedException('Authentication is required');
    }

    const token = req.headers.authorization.split(' ')[1];
    let payload;

    try {
      payload = jwt.verify(token, this.config.get<string>('JWT_SECRET_KEY'));
    } catch (e) {
      if (e.name !== 'JsonWebTokenError') {
        this.logger.error(`Unexpected error during user token validation: ${e}`);
      }
      throw new UnauthorizedException('Invalid token');
    }

    const { userId, passwordChangedAt } = payload;
    const user = await this.usersService.findById(userId, true);

    if (!user) {
      // If we got here, the token was valid (at some point in time), but the id in the payload
      // couldn't be resolved to a user. Rather than explain this to the user, we'll just say
      // that the token has "expired":
      throw new UnauthorizedException('Expired token');
    }

    // When the user changes their password, the check below will treat all of their previous
    // JWT tokens as expired because the passwordChangedAt values won't match.
    if (passwordChangedAt !== user.passwordChangedAt?.toISOString()) {
      throw new UnauthorizedException('Expired token');
    }

    // Check the user's updatedAt time. If it's greater than 6 hours ago, update it to the current
    // time. This is how we will keep track of how recently a user has been "active" on the site.
    // We mostly just want to know if they logged in within the last day, so that's why 6 hour
    // checks are fine.
    if (DateTime.fromJSDate(user.updatedAt).diffNow().as('hours') < -6) {
      try {
        await this.usersService.update(user.id, {
          updatedAt: new Date(),
        });
      } catch (e) {
        // DB may be in read-only mode, which would make the above update fail.  That's fine.
        // In that case, catch will make this fail silently.
      }
    }

    (req as any).user = user;

    return true;
  }
}
