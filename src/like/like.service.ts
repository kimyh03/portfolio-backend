import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ToggleLikeInput,
  ToggleLikeOutput,
} from 'src/like/dtos/toggleLike.dto';
import { Post } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likes: Repository<Like>,
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
  ) {}

  async toggleLike(
    { postId }: ToggleLikeInput,
    userId: number,
  ): Promise<ToggleLikeOutput> {
    try {
      await this.posts.findOneOrFail(postId);
      const existLike = await this.likes.findOne({ where: { postId, userId } });
      if (existLike) {
        await this.likes.remove(existLike);
      } else {
        const newLike = this.likes.create({ postId, userId });
        await this.likes.save(newLike);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}
