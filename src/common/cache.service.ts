import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import config from '../config';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(config.redisUrl);
    console.log(
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      config.redisUrl,
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return v ? JSON.parse(v) : null;
  }

  async set(key: string, value: any, ttlSec = config.cacheTtlSec) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
}
