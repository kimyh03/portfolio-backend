import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { CommentService } from './comment.service';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';

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

describe('CommentService', () => {
  let commentService: CommentService;
  let questionRepository: MockRepository<Question>;
  let answerRepository: MockRepository<Answer>;
  let postRepository: MockRepository<Post>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Answer),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    commentService = module.get(CommentService);
    questionRepository = module.get(getRepositoryToken(Question));
    answerRepository = module.get(getRepositoryToken(Answer));
    postRepository = module.get(getRepositoryToken(Post));
  });

  describe('createQuestion', () => {
    const createQuestionArgs = {
      postId: 1,
      text: 'test',
    };
    it('should fail witn not found post id', async () => {
      postRepository.findOneOrFail.mockRejectedValue(new Error('not found'));

      const result = await commentService.createQuestion(createQuestionArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should create question', async () => {
      postRepository.findOneOrFail.mockResolvedValue(createQuestionArgs);

      const result = await commentService.createQuestion(createQuestionArgs, 1);

      expect(questionRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('createAnswer', () => {
    const createAnswerArgs = {
      questionId: 1,
      text: 'test',
    };
    const mockPost = {
      userId: 1,
    };
    it('should fail with not found question id', async () => {
      questionRepository.findOneOrFail.mockRejectedValue(
        new Error('not found'),
      );

      const result = await commentService.createAnswer(createAnswerArgs, 1);

      expect(result).toEqual({ ok: false, error: 'not found' });
    });
    it('should fail with not author id', async () => {
      questionRepository.findOneOrFail.mockResolvedValue({
        ...createAnswerArgs,
        post: mockPost,
      });

      const result = await commentService.createAnswer(createAnswerArgs, 666);

      expect(result).toEqual({
        ok: false,
        error: "You don't have a permission",
      });
    });
    it('should create answer', async () => {
      questionRepository.findOneOrFail.mockResolvedValue({
        ...createAnswerArgs,
        post: mockPost,
      });

      const result = await commentService.createAnswer(createAnswerArgs, 1);

      expect(answerRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ok: true,
      });
    });
  });
});
