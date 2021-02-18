import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/shared/auth/auth.guard';
import { AuthUser } from 'src/shared/auth/authUser.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
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
    return await this.postService.createPost(input, authUser);
  }
}
