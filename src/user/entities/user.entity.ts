import { Field, ObjectType } from '@nestjs/graphql';
import { Application } from 'src/application/entities/application.entity';
import { Certificate } from 'src/certificate/entities/certificate.entity';
import { Question } from 'src/post/entities/question.entity';
import { Like } from 'src/post/entities/like.entity';
import { Post } from 'src/post/entities/post.entity';
import { CoreEntity } from 'src/shared/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@ObjectType()
@Entity('User')
export class User extends CoreEntity {
  // 이메일(로그인 ID)
  @Field()
  @Column({ unique: true })
  email: string;

  // 사용자 넥네임
  @Field()
  @Column()
  username: string;

  // 비밀번호(로그인 PW)
  @Field()
  @Column()
  password: string;

  // 프로필 사진
  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  // 총 봉사활동 횟수(certificates coulmn count)
  @Field()
  activityCount: number;

  // 총 봉사시간
  @Field()
  activityTime: number;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post) => post.user, { nullable: true })
  posts?: Post[];

  @Field(() => [Application], { nullable: true })
  @OneToMany(() => Application, (application) => application.user, {
    nullable: true,
  })
  applications?: Application[];

  @Field(() => [Like], { nullable: true })
  @OneToMany(() => Like, (like) => like.user, { nullable: true })
  likes: Like[];

  @Field(() => [Question], { nullable: true })
  @OneToMany(() => Question, (question) => question.user, { nullable: true })
  questions?: Question[];

  @Field(() => [Certificate], { nullable: true })
  @OneToMany(() => Certificate, (certificate) => certificate.user, {
    nullable: true,
  })
  certificates?: Certificate[];
}
