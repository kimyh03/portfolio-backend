import { Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/shared/core.entity';
import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm';
import { Question } from './question.entity';

// 봉사활동 모집 공고 질문에 대한 답변

@ObjectType()
@Entity('Answer')
export class Answer extends CoreEntity {
  // 답변 내용
  @Field()
  @Column()
  text: string;

  @Field(() => Question)
  @OneToOne(() => Question, (question) => question.answer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: Question;

  @Field()
  @RelationId((answer: Answer) => answer.question)
  @Column({ nullable: true })
  questionId: number;
}
