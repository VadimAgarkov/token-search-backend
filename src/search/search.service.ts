import { Inject, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { ISearchProvider } from './providers/interfaces/search-provider.interface';
import config from '../config';
import { SearchApiResult } from './interfaces/search-api-result.interface';
import { DexscreenerResponse } from './interfaces/dexscreener-response.interface';
import { mapDexscreener } from './mappers/dexscreener.mapper';
import { Counter, Histogram, register } from 'prom-client';

export interface SearchResult<T = any> {
  source: string;
  raw: T;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger('SearchService');

  private readonly searchRequestsTotal: Counter<string>;
  private readonly searchRequestDuration: Histogram<string>;
  private readonly searchErrorsTotal: Counter<string>;

  constructor(
    private readonly cache: CacheService,
    @Inject('SEARCH_PROVIDERS') private readonly providers: ISearchProvider[],
  ) {
    this.searchRequestsTotal = this.getOrCreateCounter(
      'search_requests_total',
      'Total number of search requests',
    );

    this.searchRequestDuration = this.getOrCreateHistogram(
      'search_request_duration_seconds',
      'Duration of search requests in seconds',
      [0.1, 0.5, 1, 2, 5],
    );

    this.searchErrorsTotal = this.getOrCreateCounter(
      'search_errors_total',
      'Total number of errors during search',
    );
  }

  private getOrCreateCounter(name: string, help: string): Counter<string> {
    const existing = register.getSingleMetric(name);
    if (existing && existing instanceof Counter) {
      return existing;
    }
    return new Counter({ name, help, registers: [register] });
  }

  private getOrCreateHistogram(
    name: string,
    help: string,
    buckets: number[],
  ): Histogram<string> {
    const existing = register.getSingleMetric(name);
    if (existing && existing instanceof Histogram) {
      return existing;
    }
    return new Histogram({ name, help, buckets, registers: [register] });
  }

  private buildCacheKey(type: string, q: string) {
    return `search:${type}:${q.toLowerCase()}`;
  }

  async search(
    q: string,
    type: 'address' | 'pair' | 'name',
  ): Promise<{ source: string; results: SearchApiResult[] }> {
    this.searchRequestsTotal.inc();
    const endTimer = this.searchRequestDuration.startTimer();

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
    } catch (error) {
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
