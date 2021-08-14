import { Options } from '@mikro-orm/core';
import path from 'path';
import { __PROD__ } from './constants';
import { Post } from './entities/Posts';

const config: Options = {
  type: 'postgresql',
  user: 'postgres',
  password: 'postgres',
  dbName: 'lireddit',  
  entities: [Post],
  migrations:{
    path: path.join(__dirname,'./migrations'), 
    pattern: /^[\w-]+\d+\.[tj]s$/, 
  },
  debug: !__PROD__,
};

export default config;