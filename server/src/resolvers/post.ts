import { Post } from '../entities/Posts';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session!.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session!.userId,
    });

    return updoot ? updoot.value : null;
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.length > 200
      ? root.text.slice(0, 200).trimEnd() + '...'
      : root.text;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session!;

    const updoot = await Updoot.findOne({ where: { postId, userId } });
    // user has already voted on the post
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        UPDATE updoot SET VALUE = $1
        WHERE "postId" = $2 and "userId" = $3`,
          [realValue, postId, userId]
        );

        await tm.query(`UPDATE post SET points = points + $1 WHERE id = $2`, [
          2 * realValue,
          postId,
        ]);
      });
    } else if (!updoot) {
      // user have not voted before
      getConnection().transaction(async (tm) => {
        await tm.query(
          `
        INSERT INTO updoot ("userId","postId",value)
        VALUES ($1,$2,$3);`,
          [userId, postId, realValue]
        );

        await tm.query(
          `
        UPDATE post
        SET points = points + $1 
        WHERE id = $2;
        `,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
    SELECT p.*
    FROM post p
    ${cursor ? `WHERE p."createdAt" < $2` : ''}
    ORDER BY p."createdAt" DESC
    LIMIT $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session!.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String) title: string,
    @Arg('text', () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session!.userId,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      // not cascade way...
      // const post = await Post.findOne(id);
      // if (!post) {
      //   return false;
      // }
      // if (post.creatorId !== req.session!.userId) {
      //   throw new Error('not authorized');
      // }
      // await Updoot.delete({ postId: id });
      // await Post.delete({ id, creatorId: req.session!.userId });

      await Post.delete({ id, creatorId: req.session!.userId });
      return true;
    } catch (error) {
      return false;
    }
  }
}
