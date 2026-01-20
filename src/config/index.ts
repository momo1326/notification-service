import { Pool } from 'pg';

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'notification_db',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
};

export const pool = new Pool(dbConfig);

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};