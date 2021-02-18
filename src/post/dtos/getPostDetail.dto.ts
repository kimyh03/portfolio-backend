import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/shared/core.dto';
import { Post } from '../entities/post.entity';

@InputType()
export class GetPostDetailInput {
  @Field()
  postId: number;
}

@ObjectType()
export class GetPostDetailOutput extends CoreOutput {
  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field({ defaultValue: false, nullable: true })
  isMine?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isLiked?: boolean;

  @Field({ defaultValue: false, nullable: true })
  isApplied?: boolean;
}
