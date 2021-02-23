import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Like } from './entities/like.entity';
import { LikeResolver } from './like.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Post])],
  providers: [LikeResolver],
})
export class LikeModule {}
