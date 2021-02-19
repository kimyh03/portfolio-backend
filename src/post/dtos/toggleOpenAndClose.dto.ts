import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class ToggleOpenAndCloseInput {
  @Field()
  postId: number;
}

@ObjectType()
export class ToggleOpenAndCloseOutput extends CoreOutput {}
