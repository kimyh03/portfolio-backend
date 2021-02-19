import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/shared/auth/auth.guard';
import { AuthUser } from 'src/shared/auth/authUser.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import {
  CreateQuestionInput,
  CreateQuestionOutput,
} from './dtos/createQuestion.dto';
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
import { Question } from './entities/question.entity';
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

  @UseGuards(Auth)
  @Mutation(() => ToggleOpenAndCloseOutput)
  async toggleOpenAndClose(
    @Args('input') input: ToggleOpenAndCloseInput,
    @AuthUser() authUser: User,
  ): Promise<ToggleOpenAndCloseOutput> {
    return await this.postService.toggleOpenAndClose(input, authUser.id);
  }

  @Query(() => GetPostsOutput)
  async getPosts(@Args('input') input: GetPostsInput): Promise<GetPostsOutput> {
    return await this.postService.getPosts(input);
  }
}

@Resolver(() => Like)
export class LikeResolver {
  constructor(private readonly postService: PostService) {}

  @UseGuards(Auth)
  @Mutation(() => ToggleLikeOutput)
  async toggleLike(
    @Args('input') input: ToggleLikeInput,
    @AuthUser() authUser: User,
  ): Promise<ToggleLikeOutput> {
    return await this.postService.toggleLike(input, authUser.id);
  }
}

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly postService: PostService) {}

  @UseGuards(Auth)
  @Mutation(() => CreateQuestionOutput)
  async createQuestion(
    @Args('input') input: CreateQuestionInput,
    @AuthUser() authuser: User,
  ): Promise<CreateQuestionOutput> {
    return await this.postService.createQuestion(input, authuser.id);
  }
}
