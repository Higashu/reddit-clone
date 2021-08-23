import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity
} from 'typeorm';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: Date })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: Date })
  updatedAt: Date;

  @Field(() => String)
  @Column({ type: 'text' })
  title!: string;
}
