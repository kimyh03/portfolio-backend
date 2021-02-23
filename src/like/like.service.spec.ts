import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { LikeService } from './like.service';

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

describe('LikeService', () => {
  let likeService: LikeService;
  let likeRepository: MockRepository<Like>;

  let postRepository: MockRepository<Post>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: getRepositoryToken(Like),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    likeService = module.get<LikeService>(LikeService);
    likeRepository = module.get(getRepositoryToken(Like));
    postRepository = module.get(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(likeService).toBeDefined();
    expect(likeRepository).toBeDefined();
  });

  describe('toggleLike', () => {
    const toggleLikeArgs = {
      postId: 1,
    };
    const mockLike = {
      postId: 1,
      userId: 1,
    };
    it('should fail with not found postId', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await likeService.toggleLike(toggleLikeArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should create new like (like)', async () => {
      postRepository.findOneOrFail.mockResolvedValue(toggleLikeArgs);
      likeRepository.findOne.mockResolvedValue(null);

      const result = await likeService.toggleLike(toggleLikeArgs, 1);

      expect(likeRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
    it('should remove exist like (unlike)', async () => {
      postRepository.findOneOrFail.mockResolvedValue(toggleLikeArgs);
      likeRepository.findOne.mockResolvedValue(mockLike);

      const result = await likeService.toggleLike(toggleLikeArgs, 1);

      expect(likeRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });
});
