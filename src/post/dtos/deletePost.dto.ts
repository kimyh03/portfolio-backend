import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class DeletePostInput {
  @Field()
  postId: number;
}

@ObjectType()
export class DeletePostoutput extends CoreOutput {}
