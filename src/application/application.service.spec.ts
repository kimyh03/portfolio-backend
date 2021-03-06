import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { ApplicationService } from './application.service';
import {
  Application,
  applicationStatusEnum,
} from './entities/application.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

describe('ApplicationService', () => {
  let service: ApplicationService;
  let applicationRepository: MockRepository<Application>;

  let postRepository: MockRepository<Post>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    applicationRepository = module.get(getRepositoryToken(Application));
    postRepository = module.get(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggleApply', () => {
    const toggleApplyArgs = {
      postId: 1,
    };
    it('should fail with not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('notfound'));

      const result = await service.toggleApply(toggleApplyArgs, 1);

      expect(result).toEqual({ ok: false, error: 'notfound' });
    });
    it('should fail if isOpened false', async () => {
      postRepository.findOneOrFail.mockResolvedValue({ isOpened: false });
      applicationRepository.findOne.mockResolvedValue(null);

      const result = await service.toggleApply(toggleApplyArgs, 1);

      expect(result).toEqual({ ok: false, error: '????????? ?????? ???????????????.' });
    });
    it('should create application(apply for post)', async () => {
      postRepository.findOneOrFail.mockResolvedValue({ isOpen: true });
      applicationRepository.findOne.mockResolvedValue(null);

      const result = await service.toggleApply(toggleApplyArgs, 1);

      expect(applicationRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
    it('should delete application(cancel application)', async () => {
      postRepository.findOneOrFail.mockResolvedValue({ isOpen: true });
      applicationRepository.findOne.mockResolvedValue({ id: 1 });

      const result = await service.toggleApply(toggleApplyArgs, 1);

      expect(applicationRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('handelApplication', () => {
    const handleApplicationArgs = {
      applicationId: 1,
      status: applicationStatusEnum.accepted,
    };
    it('should fail with not found application id', async () => {
      applicationRepository.findOneOrFail.mockRejectedValue(
        new Error('not found'),
      );

      const result = await service.handleApplication(handleApplicationArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should fail with not found post id', async () => {
      applicationRepository.findOneOrFail.mockResolvedValue({ id: 1 });
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await service.handleApplication(handleApplicationArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should fail with not author id', async () => {
      applicationRepository.findOneOrFail.mockResolvedValue({ id: 1 });
      postRepository.findOneOrFail.mockResolvedValue({ userId: 1 });

      const result = await service.handleApplication(handleApplicationArgs, 2);

      expect(result).toEqual({
        ok: false,
        error: "You don't have a permission",
      });
    });
    it('should update status', async () => {
      applicationRepository.findOneOrFail.mockResolvedValue({ id: 1 });
      postRepository.findOneOrFail.mockResolvedValue({ userId: 1 });

      const result = await service.handleApplication(handleApplicationArgs, 1);

      expect(applicationRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });
});
