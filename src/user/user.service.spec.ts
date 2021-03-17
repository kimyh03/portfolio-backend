import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from 'src/application/entities/application.entity';
import { AuthService } from 'src/shared/auth/auth.service';
import { Like } from 'src/like/entities/like.entity';
import { S3Service } from 'src/shared/S3/S3.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { CacheService } from 'src/shared/cache/cache.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

const mockAuthService = () => ({
  signToken: jest.fn(() => 'token'),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

const mockCacheServiceRedis = () => ({
  get: jest.fn(() => 'user from redis'),
  set: jest.fn(),
});

const mockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
});

const mockS3Service = () => ({
  delete: jest.fn(),
});
jest.mock('bcrypt');
const { compare } = bcrypt as jest.Mocked<typeof import('bcrypt')>;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;

  let authService: AuthService;
  let configService: ConfigService;
  let likeRepository: MockRepository<Like>;
  let applicationRepository: MockRepository<Application>;
  let s3Service: S3Service;
  let cacheService: CacheService;

  let redisState: boolean;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: AuthService,
          useValue: mockAuthService(),
        },
        {
          provide: ConfigService,
          useValue: mockConfigService(),
        },
        {
          provide: getRepositoryToken(Like),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository(),
        },
        {
          provide: S3Service,
          useValue: mockS3Service(),
        },
        {
          provide: CacheService,
          useValue: redisState ? mockCacheServiceRedis() : mockCacheService(),
        },
      ],
    }).compile();
    userRepository = module.get(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    likeRepository = module.get(getRepositoryToken(Like));
    applicationRepository = module.get(getRepositoryToken(Application));
    s3Service = module.get<S3Service>(S3Service);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
    expect(configService).toBeDefined();
    expect(likeRepository).toBeDefined();
    expect(applicationRepository).toBeDefined();
  });

  describe('getProfile', () => {
    const testUserArgs = {
      id: 1,
    };
    it('should fail with not found user id', async () => {
      userRepository.findOneOrFail.mockRejectedValue(
        new Error('The user not found'),
      );
      const result = await userService.getProfile(false, { userId: 999 });
      expect(result).toEqual({ ok: false, error: 'The user not found' });
    });
    it('should get others profile', async () => {
      userRepository.findOneOrFail.mockResolvedValue(testUserArgs);
      const result = await userService.getProfile(false, {
        userId: testUserArgs.id,
      });
      expect(result).toEqual({
        ok: true,
        isSelf: false,
        user: testUserArgs,
      });
    });
    it('should get my profile', async () => {
      userRepository.findOneOrFail.mockResolvedValue(testUserArgs);
      likeRepository.find.mockResolvedValue([]);
      applicationRepository.find.mockResolvedValue([]);
      const result = await userService.getProfile(true, {
        userId: testUserArgs.id,
      });
      expect(result).toEqual({
        ok: true,
        isSelf: true,
        user: testUserArgs,
      });
    });
  });

  describe('editAvatar', () => {
    const testUserArgs = {
      id: 1,
    };
    const testInput = {
      avatarKey: 'avatarKey',
    };
    it('should fail with not found user id', async () => {
      userRepository.findOneOrFail.mockRejectedValue(
        new Error('The user not found'),
      );
      const result = await userService.editAvatar(testUserArgs.id, testInput);
      expect(result).toEqual({
        ok: false,
        error: 'The user not found',
      });
    });
    it('should add avatar url', async () => {
      userRepository.findOneOrFail.mockResolvedValue(testUserArgs);
      const result = await userService.editAvatar(testUserArgs.id, testInput);

      expect(s3Service.delete).toHaveBeenCalledTimes(0);
      expect(result).toEqual({
        ok: true,
      });
    });
    it('should replace avatar url', async () => {
      const testUserArgs = {
        id: 1,
        avatar: 'avatar',
      };
      userRepository.findOneOrFail.mockResolvedValue(testUserArgs);

      const result = await userService.editAvatar(testUserArgs.id, testInput);

      expect(s3Service.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ok: true,
      });
    });
  });

  describe('signUp', () => {
    const signUpArgs = {
      email: 'test@test.com',
      password: 'password',
      username: 'test',
    };
    it('should fail with exist email', async () => {
      userRepository.findOne.mockResolvedValue(signUpArgs);

      const result = await userService.signUp(signUpArgs);

      expect(result).toEqual({ ok: false, error: '이미 가입된 정보입니다.' });
    });
    it('should sign up (create user)', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ ...signUpArgs, id: 1 });

      const { ok, token } = await userService.signUp(signUpArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(ok).toBe(true);
      expect(token).toBe('token');
    });
  });

  describe('signIn', () => {
    const signInArgs = {
      email: 'test@test.com',
      password: 'password',
    };
    it('should fail with not found email', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.signIn(signInArgs);

      expect(result).toEqual({ ok: false, error: '로그인 정보를 확인하세요.' });
    });
    it('should fail with wrong password', async () => {
      userRepository.findOne.mockResolvedValue(signInArgs);
      compare.mockResolvedValue(false);

      const result = await userService.signIn(signInArgs);

      expect(result).toEqual({ ok: false, error: '로그인 정보를 확인하세요.' });
    });
    it('should log in', async () => {
      userRepository.findOne.mockResolvedValue(signInArgs);
      compare.mockResolvedValue(true);

      const result = await userService.signIn(signInArgs);

      expect(result).toEqual({ ok: true, token: 'token' });
    });
  });

  describe('findOneById', () => {
    const findOneByIdArgs = {
      id: 1,
    };
    it('should find one', async () => {
      userRepository.findOne.mockResolvedValue(findOneByIdArgs);

      const result = await userService.findOneById(1);

      expect(result).toBe(findOneByIdArgs);
    });
  });

  describe('getMe', () => {
    it.todo('should find me from redis');
    it.todo('should find me from database');
    it.todo('should fail on exception');
  });
});
