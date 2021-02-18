import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/entities/application.entity';
import { Repository } from 'typeorm';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import {
  GetPostDetailInput,
  GetPostDetailOutput,
} from './dtos/getPostDetail.dto';
import { Like } from './entities/like.entity';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(Like)
    private readonly likes: Repository<Like>,
  ) {}

  async createPost(
    input: CreatePostInput,
    userId: number,
  ): Promise<CreatePostOutput> {
    try {
      const newPost = this.posts.create({ ...input, userId });
      await this.posts.save(newPost);
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

  async getPostDetail(
    { postId }: GetPostDetailInput,
    userId?: number,
  ): Promise<GetPostDetailOutput> {
    try {
      const post = await this.posts.findOneOrFail(postId, {
        relations: [
          'user',
          'questions',
          'questions.user',
          'questions.answer',
          'likes',
          'likes.user',
        ],
      });

      let isMine, isLiked, isApplied;
      if (userId) {
        isMine = post.userId === userId;
        const existLike = await this.likes.findOne({
          where: { postId, userId },
        });
        if (existLike) {
          isLiked = true;
        }
        const existApplication = await this.applications.findOne({
          where: { postId, userId },
        });
        if (existApplication) {
          isApplied = true;
        }
      }
      return {
        ok: true,
        post,
        isMine,
        isLiked,
        isApplied,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }
}
