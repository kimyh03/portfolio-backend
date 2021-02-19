import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from 'src/application/entities/application.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post, postCategoryEnum, postRigionEnum } from './entities/post.entity';
import { Question } from './entities/question.entity';
import { PostService } from './post.service';
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

describe('PostService', () => {
  let postService: PostService;
  let postRepository: MockRepository<Post>;

  let likeRepository: MockRepository<Like>;
  let applicationRepository: MockRepository<Application>;
  let questionRepository: MockRepository<Question>;

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
      ],
    }).compile();
    postService = module.get<PostService>(PostService);
    postRepository = module.get(getRepositoryToken(Post));
    likeRepository = module.get(getRepositoryToken(Like));
    applicationRepository = module.get(getRepositoryToken(Application));
    questionRepository = module.get(getRepositoryToken(Question));
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

      const result = await postService.toggleLike(toggleLikeArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should create new like (like)', async () => {
      postRepository.findOneOrFail.mockResolvedValue(toggleLikeArgs);
      likeRepository.findOne.mockResolvedValue(null);

      const result = await postService.toggleLike(toggleLikeArgs, 1);

      expect(likeRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
    it('should remove exist like (unlike)', async () => {
      postRepository.findOneOrFail.mockResolvedValue(toggleLikeArgs);
      likeRepository.findOne.mockResolvedValue(mockLike);

      const result = await postService.toggleLike(toggleLikeArgs, 1);

      expect(likeRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('createQuestion', () => {
    const createQuestionArgs = {
      postId: 1,
      text: 'test',
    };
    it('should fail witn not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await postService.createQuestion(createQuestionArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should create question', async () => {
      postRepository.findOneOrFail.mockResolvedValue(createQuestionArgs);

      const result = await postService.createQuestion(createQuestionArgs, 1);

      expect(questionRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });
});
