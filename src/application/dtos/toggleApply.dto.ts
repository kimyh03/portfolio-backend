import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class ToggleApplyInput {
  @Field()
  postId: number;
}

@ObjectType()
export class ToggleApplyOutput extends CoreOutput {}
