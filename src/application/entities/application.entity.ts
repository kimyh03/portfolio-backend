import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import { CoreEntity } from 'src/shared/core.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

// 봉사활동 모집 공고에 대한 참가 신청

export enum applicationStatusEnum {
  pendding = 'pendding',
  accepted = 'accepted',
  rejected = 'rejected',
}

registerEnumType(applicationStatusEnum, { name: 'applicationStatus' });

@ObjectType()
@Entity('Application')
export class Application extends CoreEntity {
  // 참가 신청의 수락여부
  @Field()
  @Column({
    type: 'enum',
    enum: applicationStatusEnum,
    default: applicationStatusEnum.pendding,
  })
  status: applicationStatusEnum;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  user: User;

  @Field()
  @RelationId((application: Application) => application.user)
  @Column()
  userId: number;

  @Field()
  @ManyToOne(() => Post, (post) => post.applications, { onDelete: 'CASCADE' })
  post: Post;

  @Field()
  @RelationId((application: Application) => application.post)
  @Column()
  postId: number;
}
