import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class CreateQuestionInput {
  @Field()
  postId: number;

  @Field()
  text: string;
}

@ObjectType()
export class CreateQuestionOutput extends CoreOutput {}
