import { Field, Int, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Post } from './Posts';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: 'text', unique: true })
  username!: string;

  @Field(() => String)
  @Column({ type: 'text', unique: true })
  email!: string;

  // Pas de Field pour pas rendre le champ disponible dans GraphQL
  @Column({ type: 'text' })
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Updoot, (updoot) => updoot.user )
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn({ type: Date })
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn({ type: Date })
  updatedAt = Date();
}
