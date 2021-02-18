import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/shared/auth/auth.guard';
import { AuthUser } from 'src/shared/auth/authUser.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import { DeletePostInput, DeletePostoutput } from './dtos/deletePost.dto';
import {
  GetPostDetailInput,
  GetPostDetailOutput,
} from './dtos/getPostDetail.dto';
import { Post } from './entities/post.entity';
import { PostService } from './post.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostService) {}

  @UseGuards(Auth)
  @Mutation(() => CreatePostOutput)
  async createPost(
    @AuthUser() authUser: User,
    @Args('input') input: CreatePostInput,
  ): Promise<CreatePostOutput> {
    return await this.postService.createPost(input, authUser.id);
  }

  @Query(() => GetPostDetailOutput)
  async getPostDetail(
    @AuthUser() authUser: User,
    @Args('input') input: GetPostDetailInput,
  ): Promise<GetPostDetailOutput> {
    let userId;
    if (authUser) {
      userId = authUser.id;
    }
    return await this.postService.getPostDetail(input, userId);
  }

  @UseGuards(Auth)
  @Mutation(() => DeletePostoutput)
  async deletePost(
    @Args('input') input: DeletePostInput,
    @AuthUser() authUser: User,
  ): Promise<DeletePostoutput> {
    return await this.postService.deletePost(input, authUser.id);
  }
}
