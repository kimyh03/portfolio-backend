import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/shared/auth/auth.service';
import { SignUpInput, SignUpOutput } from './dtos/signUp.dto';
import { SignInInput, SignInOutput } from './dtos/signIn.dto';
import { ConfigService } from '@nestjs/config';
import { HASH_ROUNDS } from 'src/shared/constants';
import { GetProfileInput, GetprofileOutput } from './dtos/getProfile.dto';
import { EditAvatarInput, EditAvatarOutput } from './dtos/editAvatar.dto';
import { S3Service } from 'src/shared/S3/S3.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { GetMeOutput } from './dtos/getMe.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly cacheService: CacheService,
  ) {}

  async signUp({
    email,
    password,
    username,
  }: SignUpInput): Promise<SignUpOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (user) {
        throw new Error('이미 가입된 정보입니다.');
      }
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
        throw new Error('로그인 정보를 확인하세요.');
      }
      const compared = await bcrypt.compare(password, user.password);
      if (!compared) {
        throw new Error('로그인 정보를 확인하세요.');
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

  async getProfile(
    isSelf: boolean,
    { userId }: GetProfileInput,
  ): Promise<GetprofileOutput> {
    try {
      let user: User;
      if (isSelf) {
        user = await this.users.findOneOrFail({
          where: { id: userId },
          relations: [
            'posts',
            'certificates',
            'likes',
            'likes.post',
            'applications',
            'applications.post',
          ],
        });
      } else {
        user = await this.users.findOneOrFail({
          where: { id: userId },
          relations: ['posts', 'certificates'],
        });
      }
      return {
        ok: true,
        isSelf,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }

  async editAvatar(
    userId: number,
    { avatarKey }: EditAvatarInput,
  ): Promise<EditAvatarOutput> {
    try {
      const avatarUrl = `https://hoony-portfolio.s3.ap-northeast-2.amazonaws.com/${avatarKey}`;
      const user = await this.users.findOneOrFail(userId);
      if (user.avatar) {
        await this.s3Service.delete(user.avatar.split('avatar')[1]);
      }
      user.avatar = avatarUrl;
      await this.cacheService.set(`user_${userId}`, user);
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }

  async getMe(userId: number): Promise<GetMeOutput> {
    try {
      let user: User;
      let fromWhere: string;
      const userFromRedis = await this.cacheService.get(`user_${userId}`);
      if (userFromRedis) {
        user = userFromRedis;
        fromWhere = 'redis';
      } else {
        const userFromDatabase = await this.users.findOneOrFail(userId);
        await this.cacheService.set(`user_${userId}`, userFromDatabase);
        user = userFromDatabase;
        fromWhere = 'database';
      }
      return { ok: true, user, fromWhere };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}
