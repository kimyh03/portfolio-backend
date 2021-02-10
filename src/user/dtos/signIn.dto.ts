import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../shared/core.dto';
@InputType()
export class SignInInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class SignInOutput extends CoreOutput {
  @Field({ nullable: true })
  token?: string;
}
