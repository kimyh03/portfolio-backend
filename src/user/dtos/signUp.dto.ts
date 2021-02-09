import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class SignUpInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  username: string;
}

@ObjectType()
export class SignUpOutput {
  @Field({ nullable: true })
  ok?: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  token?: string;
}
