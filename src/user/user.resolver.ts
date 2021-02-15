import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/authUser.decorator';
import { EditAvatarInput, EditAvatarOutput } from './dtos/editAvatar.dto';
import { GetProfileInput, GetprofileOutput } from './dtos/getProfile.dto';
import { SignInInput, SignInOutput } from './dtos/signIn.dto';
import { SignUpInput, SignUpOutput } from './dtos/signUp.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => String)
  getHello() {
    return 'Hello';
  }

  @Mutation(() => SignUpOutput)
  async signUp(@Args('input') input: SignUpInput): Promise<SignUpOutput> {
    return await this.userService.signUp(input);
  }

  @Mutation(() => SignInOutput)
  async signIn(@Args('input') input: SignInInput): Promise<SignInOutput> {
    return await this.userService.signIn(input);
  }

  @Query(() => GetprofileOutput)
  async getProfile(
    @AuthUser() authUser: User,
    @Args('input') input: GetProfileInput,
  ): Promise<GetprofileOutput> {
    const isSelf = authUser?.id === input.userId;
    return await this.userService.getProfile(isSelf, input);
  }

  @UseGuards(Auth)
  @Mutation(() => EditAvatarOutput)
  async editAvatar(
    @AuthUser() authUser: User,
    @Args('input') input: EditAvatarInput,
  ): Promise<EditAvatarOutput> {
    return await this.userService.editAvatar(authUser.id, input);
  }
}
