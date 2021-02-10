import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

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
export class SignUpOutput extends CoreOutput {
  @Field({ nullable: true })
  token?: string;
}
