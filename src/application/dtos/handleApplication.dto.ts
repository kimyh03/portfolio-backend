import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { applicationStatusEnum } from '../entities/application.entity';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class HandleApplicationInput {
  @Field()
  applicationId: number;

  @Field(() => applicationStatusEnum)
  status: applicationStatusEnum;
}

@ObjectType()
export class HandleApplicationOutput extends CoreOutput {}
