import Redis from 'ioredis';

const redisClientSingleton = () => {
  const config = useRuntimeConfig();
  return new Redis(config.redisUrl || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
};

declare global {
  var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') {
  globalThis.redis = redis;
}

export const setToken = async (userId: number, token: string, expiresIn: number) => {
  await redis.setex(`user:${userId}:token`, expiresIn, token);
};

export const getToken = async (userId: number): Promise<string | null> => {
  return await redis.get(`user:${userId}:token`);
};

export const deleteToken = async (userId: number) => {
  await redis.del(`user:${userId}:token`);
};

export const blacklistToken = async (token: string, expiresIn: number) => {
  await redis.setex(`blacklist:${token}`, expiresIn, '1');
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
};

export const setCache = async (key: string, value: any, ttl?: number) => {
  const serialized = JSON.stringify(value);
  if (ttl) {
    await redis.setex(key, ttl, serialized);
  } else {
    await redis.set(key, serialized);
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};

export const deleteCache = async (key: string) => {
  await redis.del(key);
};

export const deleteCachePattern = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
