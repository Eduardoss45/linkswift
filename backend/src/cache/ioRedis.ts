import Redis from 'ioredis';

export let redisClient: Redis | null = null;

export const ioRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
    });

    redisClient.on('error', err => {
      console.error('Erro ao conectar ao Redis:', err);
    });
  }

  return redisClient;
};
