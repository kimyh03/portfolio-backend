import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  @Field()
  ok: boolean;

  @Field({ nullable: true })
  error?: string;
}
