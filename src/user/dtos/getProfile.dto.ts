import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Application } from 'src/application/entities/application.entity';
import { Like } from 'src/post/entities/like.entity';
import { CoreOutput } from 'src/shared/core.dto';
import { User } from '../entities/user.entity';

@InputType()
export class GetProfileInput {
  @Field()
  userId: number;
}

@ObjectType()
export class GetprofileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  isSelf?: boolean;

  @Field(() => [Like], { nullable: true })
  likes?: Like[];

  @Field(() => [Application], { nullable: true })
  applications?: Application[];
}
