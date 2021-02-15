import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';

@InputType()
export class EditAvatarInput {
  @Field()
  avatarKey: string;
}

@ObjectType()
export class EditAvatarOutput extends CoreOutput {}
