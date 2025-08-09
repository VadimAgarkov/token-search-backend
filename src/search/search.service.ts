import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { ISearchProvider } from './providers/interfaces/search-provider.interface';
import config from '../config';

export interface DexscreenerPair {
  id: string;
  name: string;
}

export interface DexscreenerToken {
  id: string;
  symbol: string;
  name: string;
}

export interface DexscreenerResponse {
  pairs: DexscreenerPair[];
  tokens: DexscreenerToken[];
}

export interface SearchResult {
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  raw: DexscreenerResponse | any;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger('SearchService');

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
  ): Promise<{ source: string; results: SearchResult[] }> {
    const key = this.buildCacheKey(type, q);

    try {
      const cached = await this.cache.get<SearchResult[]>(key);
      if (cached) {
        this.logger.log(`Cache hit for key ${key}`);
        return { source: 'cache', results: cached };
      }

      this.logger.log(`Cache miss for key ${key}, querying providers`);

      const resultsArrays = await Promise.all(
        this.providers.map(async (provider) => {
          try {
            return await provider.search(q, type);
          } catch (error) {
            this.logger.error(
              `Error from provider ${provider.constructor.name} for query "${q}": ${error instanceof Error ? error.message : error}`,
            );
            return [];
          }
        }),
      );

      const results = resultsArrays.flat();

      await this.cache.set(key, results, config.cacheTtlSec);

      return { source: 'remote', results };
    } catch (error) {
      this.logger.error(
        `Search failed for query "${q}": ${error instanceof Error ? error.message : error}`,
      );
      return { source: 'error', results: [] };
    }
  }
}
