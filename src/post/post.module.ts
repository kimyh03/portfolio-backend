import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Application } from 'src/application/entities/application.entity';
import { Certificate } from 'src/post/entities/certificate.entity';
import { Like } from 'src/like/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Application, Certificate, Like])],
  providers: [PostService, PostResolver],
})
export class PostModule {}
