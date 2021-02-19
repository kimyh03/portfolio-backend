import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';
import {
  Post,
  postCategoryEnum,
  postRigionEnum,
} from '../entities/post.entity';

@InputType()
export class GetPostsInput {
  @Field(() => [postCategoryEnum])
  categories: postCategoryEnum[];

  @Field(() => [postRigionEnum])
  rigions: postRigionEnum[];

  @Field()
  page: number;

  @Field()
  openOnly: boolean;

  @Field()
  searchTerm: string;
}

@ObjectType()
export class GetPostsOutput extends CoreOutput {
  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field({ nullable: true })
  totalCount?: number;

  @Field({ nullable: true })
  totalPage?: number;
}
