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
export class User extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: Date })
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn({ type: Date })
  updatedAt = Date();

  @Field(() => String)
  @Column({ type: 'text', unique: true })
  username!: string;

  @Field(() => String)
  @Column({ type: 'text', unique: true })
  email!: string;

  // Pas de Field pour pas rendre le champ disponible dans GraphQL
  @Column({ type: 'text' })
  password!: string;
}
