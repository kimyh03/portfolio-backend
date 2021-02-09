import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class CoreEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
