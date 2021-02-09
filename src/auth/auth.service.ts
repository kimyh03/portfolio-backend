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
      return jwt.sign({ id: userId }, this.options.jwtSecretKey);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
