import 'reflect-metadata'
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME, __PROD__ } from './constants';
import { MyContext } from './types';
import cors from 'cors';
import {createConnection} from 'typeorm';
import { User } from './entities/User';
import { Post } from './entities/Posts';
import path from 'path'
import { Updoot } from './entities/Updoot';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database:'lireddit2',
    username:'postgres',
    password:'postgres',
    logging:true,
    synchronize:true,
    migrations:[path.join(__dirname,'./migrations/*')],
    entities: [Post,User,Updoot]
  });

  await conn.runMigrations();

  const app = express();

  const redisStore = connectRedis(session as any);
  const redis = new Redis();  

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })    
  );
  
  app.use(
    session({
      name: COOKIE_NAME,
      store: new redisStore({
        client: redis,
        disableTouch: true,
        disableTTL: true,
      }) as any,
      cookie: {
        maxAge: 1000 * 60 * 60 * 1, //*365 * 10 //10 years
        httpOnly: true,
        secure: __PROD__, //Only use cookie in https
        sameSite: 'lax',
      },
      secret: 'nfjenuifezbdzinnjkdcjkfhn',
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.get('/', (_, res) => {
    res.send('hello from express');
  });

  app.listen(5000, () => {
    console.log(`Server started on http://localhost:5000`);
  });
};

main().catch((err) => {
  console.error(err);
});
