import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';

// @InputType()
// class UsernamePasswordInput {
//   @Field(() => String)
//   username: string;
//   @Field(() => String)
//   password: string;
// }

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, em, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 2',
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user not longer exists',
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    // log in user after change password

    req.session!.userId = user.id;

    await redis.del(key);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email', () => String) email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // email not in db
      return true;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 // 1 Day
    );

    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session!.userId) {
      return null;
    }

    const user = em.findOne(User, { id: req.session!.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('username', () => String) username: string,
    @Arg('password', () => String) password: string,
    @Arg('email', () => String) email: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(username, password, email);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(password);
    // const user = em.create(User, {
    //   username,
    //   password: hashedPassword,
    // });
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username,
          password: hashedPassword,
          email,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      user = result[0];
      // await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username has already been taken',
            },
          ],
        };
      }
    }

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail', () => String) usernameOrEmail: string,
    @Arg('password', () => String) password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: `Username or email doesn't exist`,
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword)
      return {
        errors: [
          {
            field: 'password',
            message: 'Invalid password',
          },
        ],
      };

    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session!.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
