import Redis, { Redis as RedisClient } from 'ioredis';

let redis: RedisClient | null = null;

export const ioRedisClient = (): RedisClient => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
    });

    redis.on('error', (err: Error) => {
      console.error('Erro ao conectar ao Redis:', err);
    });
  }
  return redis;
};