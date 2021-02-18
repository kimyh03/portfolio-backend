import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from 'src/application/entities/application.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post, postCategoryEnum, postRigionEnum } from './entities/post.entity';
import { PostService } from './post.service';
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

describe('PostService', () => {
  let postService: PostService;
  let postRepository: MockRepository<Post>;

  let likeRepository: MockRepository<Like>;
  let applicationRepository: MockRepository<Application>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Like),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    postService = module.get<PostService>(PostService);
    postRepository = module.get(getRepositoryToken(Post));
    likeRepository = module.get(getRepositoryToken(Like));
    applicationRepository = module.get(getRepositoryToken(Application));
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
    expect(postRepository).toBeDefined();
    expect(likeRepository).toBeDefined();
    expect(applicationRepository).toBeDefined();
  });

  describe('createPost', () => {
    const createPostArgs = {
      title: 'test',
      description: 'test',
      date: new Date(),
      rigion: postRigionEnum.Seoul,
      category: postCategoryEnum.communityService,
      adress: 'test',
      host: 'test',
      NumOfRecruitment: 1,
      recognizedHours: 1,
    };

    const testUser = {
      id: 1,
    };
    it('should create a post', async () => {
      postRepository.create.mockResolvedValue(createPostArgs);
      const result = await postService.createPost(createPostArgs, testUser.id);

      expect(postRepository.create).toHaveBeenCalledTimes(1);
      expect(postRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('getPostDetail', () => {
    const getPostDetailArgs = {
      id: 1,
    };
    it('should fail with not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await postService.getPostDetail({
        postId: getPostDetailArgs.id,
      });

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should get post detail (not logged in)', async () => {
      postRepository.findOneOrFail.mockResolvedValue(getPostDetailArgs);

      const result = await postService.getPostDetail({
        postId: getPostDetailArgs.id,
      });

      expect(result).toEqual({
        ok: true,
        post: getPostDetailArgs,
      });
    });
    it('should get post detail (logged in)', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...getPostDetailArgs,
        userId: 1,
      });
      likeRepository.findOne.mockResolvedValue({ id: 1 });
      applicationRepository.findOne.mockResolvedValue({ id: 1 });

      const result = await postService.getPostDetail(
        {
          postId: getPostDetailArgs.id,
        },
        1,
      );

      expect(result).toEqual({
        ok: true,
        post: { ...getPostDetailArgs, userId: 1 },
        isMine: true,
        isApplied: true,
        isLiked: true,
      });
    });
  });
});
