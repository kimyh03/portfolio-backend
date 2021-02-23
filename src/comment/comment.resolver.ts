import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/shared/auth/auth.guard';
import { AuthUser } from 'src/shared/auth/authUser.decorator';
import { User } from 'src/user/entities/user.entity';
import { CommentService } from './comment.service';
import { CreateAnswerInput, CreateAnswerOutput } from './dtos/createAnswer.dto';
import {
  CreateQuestionInput,
  CreateQuestionOutput,
} from './dtos/createQuestion.dto';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(Auth)
  @Mutation(() => CreateQuestionOutput)
  async createQuestion(
    @Args('input') input: CreateQuestionInput,
    @AuthUser() authuser: User,
  ): Promise<CreateQuestionOutput> {
    return await this.commentService.createQuestion(input, authuser.id);
  }
}

@Resolver(() => Answer)
export class AnswerResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(Auth)
  @Mutation(() => CreateAnswerOutput)
  async createAnswer(
    @Args('input') input: CreateAnswerInput,
    @AuthUser() authUser: User,
  ): Promise<CreateAnswerOutput> {
    return await this.commentService.createAnswer(input, authUser.id);
  }
}
