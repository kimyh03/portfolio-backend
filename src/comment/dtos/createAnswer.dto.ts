import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class CreateAnswerInput {
  @Field()
  questionId: number;

  @Field()
  text: string;
}

@ObjectType()
export class CreateAnswerOutput extends CoreOutput {}
