import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    postService = module.get<PostService>(PostService);
    postRepository = module.get(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
    expect(postRepository).toBeDefined();
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
});
