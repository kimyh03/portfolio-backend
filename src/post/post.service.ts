import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
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
}
