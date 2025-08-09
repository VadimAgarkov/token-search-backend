export default {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheTtlSec: process.env.CACHE_TTL_SEC
    ? Number(process.env.CACHE_TTL_SEC)
    : 60,
};
