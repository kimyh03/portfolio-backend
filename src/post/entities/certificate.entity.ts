import { Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/shared/core.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@Entity()
@ObjectType()
export class Certificate extends CoreEntity {
  //모집 공고 제목
  @Field()
  @Column()
  title: string;

  // 활동 모집 주최
  @Field()
  @Column()
  host: string;

  // 봉사활동 시간
  @Field()
  @Column()
  recognizedHours: number;

  // 활동 날짜
  @Field()
  @Column()
  date: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.certificates)
  user: User;

  @Field()
  @RelationId((certificate: Certificate) => certificate.user)
  @Column()
  userId: number;
}
