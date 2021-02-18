import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/shared/constants';
import { AuthModuleOptions } from './auth.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: AuthModuleOptions,
  ) {}
  signToken(userId: number) {
    try {
      return jwt.sign({ userId }, this.options.jwtSecretKey);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  decodeToken(token: string) {
    try {
      return jwt.verify(token, this.options.jwtSecretKey);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
