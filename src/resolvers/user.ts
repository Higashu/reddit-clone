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
  async register(
    @Arg('username', () => String) username: string,
    @Arg('password', () => String) password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (username.trim().length <= 2) {
      return {
        errors: [
          { field: 'username', message: 'length must be greater than 2' },
        ],
      };
    }
    if (password.trim().length <= 3) {
      return {
        errors: [
          { field: 'password', message: 'length must be greater than 3' },
        ],
      };
    }
    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, {
      username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
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
    return { user };
  }

  @Query(() => UserResponse)
  async login(
    @Arg('username', () => String) username: string,
    @Arg('password', () => String) password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: `Username doesn't exist`,
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

    return {
      user,
    };
  }
}
