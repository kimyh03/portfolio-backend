import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class CompletePostInput {
  @Field()
  postId: number;
}

@ObjectType()
export class CompletePostOutput extends CoreOutput {}
