import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { CreateAnswerInput, CreateAnswerOutput } from './dtos/createAnswer.dto';
import {
  CreateQuestionInput,
  CreateQuestionOutput,
} from './dtos/createQuestion.dto';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    @InjectRepository(Question)
    private readonly questions: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answers: Repository<Answer>,
  ) {}

  async createQuestion(
    { postId, text }: CreateQuestionInput,
    userId: number,
  ): Promise<CreateQuestionOutput> {
    try {
      await this.posts.findOneOrFail(postId);
      const newQuestion = this.questions.create({ postId, userId, text });
      await this.questions.save(newQuestion);
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

  async createAnswer(
    { questionId, text }: CreateAnswerInput,
    userId: number,
  ): Promise<CreateAnswerOutput> {
    try {
      const question = await this.questions.findOneOrFail(questionId, {
        relations: ['post'],
      });
      if (question.post.userId !== userId) {
        throw new Error("You don't have a permission");
      }
      const newAnswer = this.answers.create({ questionId, text });
      await this.answers.save(newAnswer);
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
}
