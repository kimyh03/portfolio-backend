import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { SignUpInput, SignUpOutput } from './dtos/signUp.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly authService: AuthService,
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
      const hashedPassword = await bcrypt.hash(password, 10);
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
}
