import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class ToggleLikeInput {
  @Field()
  postId: number;
}

@ObjectType()
export class ToggleLikeOutput extends CoreOutput {}
