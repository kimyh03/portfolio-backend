import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  ToggleLikeInput,
  ToggleLikeOutput,
} from 'src/like/dtos/toggleLike.dto';
import { Auth } from 'src/shared/auth/auth.guard';
import { AuthUser } from 'src/shared/auth/authUser.decorator';
import { User } from 'src/user/entities/user.entity';
import { Like } from './entities/like.entity';
import { LikeService } from './like.service';

@Resolver(() => Like)
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(Auth)
  @Mutation(() => ToggleLikeOutput)
  async toggleLike(
    @Args('input') input: ToggleLikeInput,
    @AuthUser() authUser: User,
  ): Promise<ToggleLikeOutput> {
    return await this.likeService.toggleLike(input, authUser.id);
  }
}
