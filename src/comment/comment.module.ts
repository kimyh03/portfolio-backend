import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerResolver, QuestionResolver } from './comment.resolver';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  providers: [QuestionResolver, AnswerResolver],
  exports: [],
})
export class UserModule {}
