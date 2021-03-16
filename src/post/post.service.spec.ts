import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Application,
  applicationStatusEnum,
} from 'src/application/entities/application.entity';
import { Certificate } from 'src/post/entities/certificate.entity';
import { Repository } from 'typeorm';
import { Answer } from '../comment/entities/answer.entity';
import { Like } from '../like/entities/like.entity';
import { Post, postCategoryEnum, postRigionEnum } from './entities/post.entity';
import { Question } from '../comment/entities/question.entity';
import { PostService } from './post.service';
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = jest.fn(() => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  getManyAndCount: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  }),
}));

describe('PostService', () => {
  let postService: PostService;
  let postRepository: MockRepository<Post>;

  let likeRepository: MockRepository<Like>;
  let applicationRepository: MockRepository<Application>;
  let certificatesRepository: MockRepository<Certificate>;

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
        {
          provide: getRepositoryToken(Question),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Answer),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Certificate),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    postService = module.get<PostService>(PostService);
    postRepository = module.get(getRepositoryToken(Post));
    likeRepository = module.get(getRepositoryToken(Like));
    applicationRepository = module.get(getRepositoryToken(Application));
    certificatesRepository = module.get(getRepositoryToken(Certificate));
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
    it('should fail on exception', async () => {
      postRepository.save.mockRejectedValue(new Error('error'));
      const result = await postService.createPost(createPostArgs, testUser.id);

      expect(result).toEqual({ ok: false, error: 'error' });
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

  describe('deletePost', () => {
    const deletePostArgs = {
      postId: 1,
    };
    it('should fail with not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await postService.deletePost(deletePostArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should fail with not author id', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...deletePostArgs,
        userId: 1,
      });

      const result = await postService.deletePost(deletePostArgs, 999);

      expect(result).toEqual({
        ok: false,
        error: "You don't have a permission",
      });
    });
    it('should delete post', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...deletePostArgs,
        userId: 1,
      });

      const result = await postService.deletePost(deletePostArgs, 1);

      expect(result).toEqual({ ok: true });
    });
  });

  describe('toggleOpenAndClose', () => {
    const toggleOpenAndCloseArgs = {
      postId: 1,
    };
    it('should fail with not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await postService.toggleOpenAndClose(
        toggleOpenAndCloseArgs,
        1,
      );

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should fail with not author id', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...toggleOpenAndCloseArgs,
        userId: 1,
      });

      const result = await postService.toggleOpenAndClose(
        toggleOpenAndCloseArgs,
        666,
      );

      expect(result).toEqual({
        ok: false,
        error: "You don't have a permission",
      });
    });
    it('should toggle to close', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...toggleOpenAndCloseArgs,
        userId: 1,
        isOpened: true,
      });

      const result = await postService.toggleOpenAndClose(
        toggleOpenAndCloseArgs,
        1,
      );

      expect(result).toEqual({ ok: true });
    });
    it('should toggle to open', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...toggleOpenAndCloseArgs,
        userId: 1,
        isOpened: false,
      });

      const result = await postService.toggleOpenAndClose(
        toggleOpenAndCloseArgs,
        1,
      );

      expect(result).toEqual({ ok: true });
    });
  });

  describe('getPosts', () => {
    it('should success / searchTerm(x), openOnly(false), category(x), rigion(x)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [],
        rigions: [],
        searchTerm: '',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should success / searchTerm(x), openOnly(true), category(x), rigion(x)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: true,
        categories: [postCategoryEnum.communityService],
        rigions: [postRigionEnum.Seoul],
        searchTerm: '',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should success / searchTerm(x), rigion(x), category(o)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [postCategoryEnum.communityService],
        rigions: [],
        searchTerm: '',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should success / searchTerm(x), rigion(o), category(x)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [],
        rigions: [postRigionEnum.Seoul],
        searchTerm: '',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should success / searchTerm(o), rigion(o), category(o)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [postCategoryEnum.communityService],
        rigions: [postRigionEnum.Seoul],
        searchTerm: 'test',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });
    it('should success / searchTerm(o), rigion(x), category(x)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [],
        rigions: [],
        searchTerm: 'test',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should success / searchTerm(o), rigion(x), category(o)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [postCategoryEnum.communityService],
        rigions: [],
        searchTerm: 'test',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should success / searchTerm(o), rigion(o), category(x)', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [],
        rigions: [postRigionEnum.Seoul],
        searchTerm: 'test',
      };
      postRepository.createQueryBuilder;
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: true,
        posts: [],
        totalCount: 0,
        totalPage: 0,
      });
    });

    it('should fail on exception', async () => {
      const getPostsArgs = {
        page: 1,
        openOnly: false,
        categories: [],
        rigions: [postRigionEnum.Seoul],
        searchTerm: 'test',
      };
      postRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockRejectedValue(new Error()),
      });
      const result = await postService.getPosts(getPostsArgs);

      expect(result).toEqual({
        ok: false,
        error: '',
      });
    });
  });

  describe('completePost', () => {
    const completePostArgs = {
      postId: 1,
    };
    it('should fail with not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await postService.completePost(completePostArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should fail with not author id', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...completePostArgs,
        userId: 1,
      });

      const result = await postService.completePost(completePostArgs, 9);

      expect(result).toEqual({
        ok: false,
        error: "You don't have a permission",
      });
    });
    it('should complete post (create certificates, remove applications, set isOpend false and isCompleted true)', async () => {
      postRepository.findOneOrFail.mockResolvedValue({
        ...completePostArgs,
        userId: 1,
        applications: [
          { id: 1, status: applicationStatusEnum.accepted, userId: 2 },
        ],
      });

      const result = await postService.completePost(completePostArgs, 1);

      expect(certificatesRepository.create).toHaveBeenCalledTimes(1);
      expect(certificatesRepository.save).toHaveBeenCalledTimes(1);
      expect(applicationRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });
});
