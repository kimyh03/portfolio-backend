import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/entities/application.entity';
import { Brackets, Repository } from 'typeorm';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import { DeletePostInput, DeletePostoutput } from './dtos/deletePost.dto';
import {
  GetPostDetailInput,
  GetPostDetailOutput,
} from './dtos/getPostDetail.dto';
import { GetPostsInput, GetPostsOutput } from './dtos/getPosts.dto';
import { ToggleLikeInput, ToggleLikeOutput } from './dtos/toggleLike.dto';
import {
  ToggleOpenAndCloseInput,
  ToggleOpenAndCloseOutput,
} from './dtos/toggleOpenAndClose.dto';
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

  async deletePost(
    { postId }: DeletePostInput,
    userId: number,
  ): Promise<DeletePostoutput> {
    try {
      const post = await this.posts.findOneOrFail(postId);
      if (post.userId !== userId) {
        throw new Error("You don't have a permission");
      }
      await this.posts.remove(post);
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

  async toggleOpenAndClose(
    { postId }: ToggleOpenAndCloseInput,
    userId: number,
  ): Promise<ToggleOpenAndCloseOutput> {
    try {
      const post = await this.posts.findOneOrFail(postId);
      if (post.userId !== userId) {
        throw new Error("You don't have a permission");
      }
      if (post.isOpened) {
        post.isOpened = false;
      } else {
        post.isOpened = true;
      }
      await this.posts.save(post);
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

  async getPosts({
    categories,
    rigions,
    page,
    openOnly,
    searchTerm,
  }: GetPostsInput): Promise<GetPostsOutput> {
    try {
      const LIMIT = 10;
      const OFFSET = (page - 1) * LIMIT;

      const baseQuery = this.posts
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.applications', 'applications')
        .orderBy('post.id', 'DESC')
        .limit(LIMIT)
        .offset(OFFSET);
      const searchQuery = baseQuery.andWhere(
        new Brackets((qb) => {
          qb.where('post.title LIKE :title', {
            title: `%${searchTerm}%`,
          }).orWhere('post.description like :description', {
            description: `%${searchTerm}%`,
          });
        }),
      );

      let query;
      const addRigionQuery = (query) =>
        query.andWhere('post.rigion IN (:...rigions)', {
          rigions,
        });
      const addCategoryQuery = (query) =>
        query.andWhere('post.category IN (:...categories)', {
          categories,
        });
      if (!searchTerm) {
        if (!categories.length && !rigions.length) {
          query = baseQuery;
        } else if (categories && !rigions.length) {
          query = addCategoryQuery(baseQuery);
        } else if (!categories.length && rigions) {
          query = addRigionQuery(baseQuery);
        } else {
          query = addRigionQuery(addCategoryQuery(baseQuery));
        }
      } else {
        if (!categories.length && !rigions.length) {
          query = searchQuery;
        } else if (categories && !rigions.length) {
          query = addCategoryQuery(searchQuery);
        } else if (!categories.length && rigions) {
          query = addRigionQuery(searchQuery);
        } else {
          query = addRigionQuery(addCategoryQuery(searchQuery));
        }
      }
      if (openOnly) {
        query = query.andWhere('post.isOpened = true');
      }

      const makeResponse = async (query) => {
        const [posts, totalCount] = await query.getManyAndCount();
        const totalPage = Math.ceil(totalCount / 10);
        return { posts, totalCount, totalPage };
      };
      const { posts, totalCount, totalPage } = await makeResponse(query);
      return { ok: true, posts, totalCount, totalPage };
    } catch (e) {
      return {
        ok: false,
        error: e.message,
      };
    }
  }

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
      return { ok: true, error: e.message };
    }
  }
}
