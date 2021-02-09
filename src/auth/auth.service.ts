import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  signToken(userId: number) {
    try {
      return jwt.sign({ id: userId }, 'secret');
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
