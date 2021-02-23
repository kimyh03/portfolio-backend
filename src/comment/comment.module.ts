import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { AnswerResolver, QuestionResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, Post])],
  providers: [QuestionResolver, AnswerResolver, CommentService],
  exports: [],
})
export class CommentModule {}
