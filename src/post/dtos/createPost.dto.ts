import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';
import { Post } from '../entities/post.entity';

@InputType()
export class CreatePostInput extends PickType(
  Post,
  [
    'title',
    'description',
    'category',
    'date',
    'rigion',
    'adress',
    'host',
    'NumOfRecruitment',
    'recognizedHours',
  ],
  InputType,
) {}

@ObjectType()
export class CreatePostOutput extends CoreOutput {}
