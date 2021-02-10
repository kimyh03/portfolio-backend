import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { SignUpInput, SignUpOutput } from './dtos/signUp.dto';
import { SignInInput, SignInOutput } from './dtos/signIn.dto';
import { ConfigService } from '@nestjs/config';
import { HASH_ROUNDS } from 'src/shared/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async signUp({
    email,
    password,
    username,
  }: SignUpInput): Promise<SignUpOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (user)
        return {
          ok: false,
          error: '이미 가입된 정보입니다.',
        };
      const hashedPassword = await bcrypt.hash(
        password,
        +this.configService.get(HASH_ROUNDS),
      );
      const newUser = this.users.create({
        email,
        password: hashedPassword,
        username,
      });
      await this.users.save(newUser);
      const token = this.authService.signToken(newUser.id);
      return {
        ok: true,
        token,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }

  async signIn({ email, password }: SignInInput): Promise<SignInOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return {
          ok: false,
          error: '로그인 정보를 확인하세요',
        };
      }
      const compared = await bcrypt.compare(password, user.password);
      if (!compared) {
        return {
          ok: false,
          error: '로그인 정보를 확인하세요',
        };
      }
      const token = this.authService.signToken(user.id);
      return {
        ok: true,
        token,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }

  async findOneById(userId: number) {
    return await this.users.findOne(userId);
  }
}
