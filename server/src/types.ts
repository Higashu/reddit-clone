import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import DataLoader from 'dataloader';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: DataLoader<number, User, number>;
  updootLoader: DataLoader<
    {
      postId: number;
      userId: number;
    },
    Updoot | null,
    {
      postId: number;
      userId: number;
    }
  >;
};
