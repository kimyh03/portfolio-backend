import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { LikeResolver, PostResolver, QuestionResolver } from './post.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Application } from 'src/application/entities/application.entity';
import { Like } from './entities/like.entity';
import { Question } from './entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Application, Like, Question])],
  providers: [PostService, PostResolver, LikeResolver, QuestionResolver],
})
export class PostModule {}
