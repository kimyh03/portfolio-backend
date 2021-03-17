import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class GetMeOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  fromWhere?: string;
}
