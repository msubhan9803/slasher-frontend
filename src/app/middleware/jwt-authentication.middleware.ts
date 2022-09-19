import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../users/providers/users.service';

@Injectable()
export class JwtAuthenticationMiddleware implements NestMiddleware {
  constructor(
    private usersService: UsersService,
    private readonly config: ConfigService,
  ) { }

  // eslint-disable-next-line class-methods-use-this
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new HttpException(
        'Authentication is required',
        HttpStatus.UNAUTHORIZED,
      );
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];
    let payload;

    try {
      payload = jwt.verify(token, this.config.get<string>('JWT_SECRET_KEY'));
    } catch (e) {
      if (e.name === 'JsonWebTokenError') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      throw e;
    }

    const { userId, passwordChangedAt } = payload;
    const user = await this.usersService.findById(userId);

    if (!user) {
      // If we got here, the token was valid (at some point in time), but the id in the payload
      // couldn't be resolved to a user. Rather than explain this to the user, we'll just say
      // that the token has "expired":
      throw new HttpException('Expired token', HttpStatus.UNAUTHORIZED);
    }

    // When the user changes their password, the check below will treat all of their previous
    // JWT tokens as expired because the passwordChangedAt values won't match.
    if (passwordChangedAt !== user.passwordChangedAt?.toISOString()) {
      throw new HttpException('Expired token', HttpStatus.UNAUTHORIZED);
    }

    (req as any).user = user;
    next();
  }
}
