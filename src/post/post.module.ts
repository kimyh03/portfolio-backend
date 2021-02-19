import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { LikeResolver, PostResolver } from './post.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Application } from 'src/application/entities/application.entity';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Application, Like])],
  providers: [PostService, PostResolver, LikeResolver],
})
export class PostModule {}
