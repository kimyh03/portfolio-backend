import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SignUpInput, SignUpOutput } from './dtos/signUp.dto';
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
}
