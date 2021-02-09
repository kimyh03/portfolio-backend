import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class SignInInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class SignInOutput {
  @Field({ nullable: true })
  ok?: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  token?: string;
}
