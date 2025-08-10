import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { ISearchProvider } from './providers/interfaces/search-provider.interface';
import config from '../config';
import { SearchApiResult } from './interfaces/search-api-result.interface';
import { DexscreenerResponse } from './interfaces/dexscreener-response.interface';
import { mapDexscreener } from './mappers/dexscreener.mapper';
import { Counter, Histogram } from 'prom-client';

export interface DexscreenerPair {
  id: string;
  name: string;
}

export interface DexscreenerToken {
  id: string;
  symbol: string;
  name: string;
}

export interface SearchResult<T = any> {
  source: string;
  raw: T;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger('SearchService');

  private searchRequestsTotal = new Counter({
    name: 'search_requests_total',
    help: 'Total number of search requests',
  });

  private searchRequestDuration = new Histogram({
    name: 'search_request_duration_seconds',
    help: 'Duration of search requests in seconds',
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private searchErrorsTotal = new Counter({
    name: 'search_errors_total',
    help: 'Total number of errors during search',
  });

  constructor(
    private readonly cache: CacheService,
    private readonly providers: ISearchProvider[],
  ) {}

  private buildCacheKey(type: string, q: string) {
    return `search:${type}:${q.toLowerCase()}`;
  }

  async search(
    q: string,
    type: 'address' | 'pair' | 'name',
  ): Promise<{ source: string; results: SearchApiResult[] }> {
    this.searchRequestsTotal.inc(); // увеличиваем счётчик запросов
    const endTimer = this.searchRequestDuration.startTimer(); // старт таймера

    try {
      const key = this.buildCacheKey(type, q);
      const cached = await this.cache.get<SearchApiResult[]>(key);

      if (cached) {
        this.logger.log(`Cache hit for key ${key}`);
        endTimer();
        return { source: 'cache', results: cached };
      }

      this.logger.log(`Cache miss for key ${key}, querying providers`);

      const resultsArrays = await Promise.all(
        this.providers.map(async (provider) => {
          try {
            if (provider.name === 'Dexscreener') {
              const rawResults = (await provider.search(
                q,
                type,
              )) as SearchResult<DexscreenerResponse>[];
              return rawResults.flatMap((r) => mapDexscreener(r.raw));
            } else {
              return [];
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Provider ${provider.name} failed: ${msg}`);
            return [];
          }
        }),
      );

      const results = resultsArrays.flat();
      await this.cache.set(key, results, config.cacheTtlSec);

      endTimer();
      return { source: 'remote', results };
    } catch (error: unknown) {
      this.searchErrorsTotal.inc();

      if (error instanceof Error) {
        this.logger.error(error.message);
      } else {
        this.logger.error('Unknown error in search service');
      }

      endTimer();
      throw error;
    }
  }
}
