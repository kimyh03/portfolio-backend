import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const payload = this.authService.decodeToken(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...res } = await this.userService.findOneById(
        payload['userId'],
      );
      req['user'] = res;
    }
    next();
  }
}
