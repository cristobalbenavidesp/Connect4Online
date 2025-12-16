import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

console.log(REDIS_URL ? `Connecting to Redis at ${REDIS_URL}` : `Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT}`);

const options: any = {
  lazyConnect: true, 
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

export const redisClient = REDIS_URL 
  ? new Redis(REDIS_URL, options)
  : new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      ...options
    });

export const subClient = redisClient.duplicate();

export const initRedis = async () => {
  try {
    await redisClient.connect();
    await subClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};
