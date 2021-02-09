import { Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/shared/core.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Post } from './post.entity';

// 봉사활동 모집 공고의 좋아요&북마크

@ObjectType()
@Entity('Like')
export class Like extends CoreEntity {
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @Field()
  @RelationId((like: Like) => like.user)
  @Column()
  userId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  @Field()
  @RelationId((like: Like) => like.post)
  @Column()
  postId: number;
}
