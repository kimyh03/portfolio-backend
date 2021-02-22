import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/shared/auth/auth.guard';
import { AuthUser } from 'src/shared/auth/authUser.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApplicationService } from './application.service';
import {
  HandleApplicationInput,
  HandleApplicationOutput,
} from './dtos/handleApplication.dto';
import { ToggleApplyInput, ToggleApplyOutput } from './dtos/toggleApply.dto';

@Resolver()
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Mutation(() => ToggleApplyOutput)
  @UseGuards(Auth)
  async toggleApply(
    @AuthUser() authUser: User,
    @Args('input') input: ToggleApplyInput,
  ): Promise<ToggleApplyOutput> {
    return await this.applicationService.toggleApply(input, authUser.id);
  }

  @Mutation(() => HandleApplicationOutput)
  @UseGuards(Auth)
  async handleApplication(
    @AuthUser() authUser: User,
    @Args('input') input: HandleApplicationInput,
  ): Promise<HandleApplicationOutput> {
    return await this.applicationService.handleApplication(input, authUser.id);
  }
}
