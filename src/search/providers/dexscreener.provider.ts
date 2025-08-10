import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISearchProvider } from './interfaces/search-provider.interface';
import { SearchResult } from '../search.service';
import { DexscreenerResponse } from '../interfaces/dexscreener-response.interface';

@Injectable()
export class DexscreenerProvider implements ISearchProvider {
  name = 'Dexscreener';
  private readonly logger = new Logger(DexscreenerProvider.name);

  constructor(private readonly http: HttpService) {}

  async search(
    q: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: 'address' | 'pair' | 'name',
  ): Promise<SearchResult[]> {
    try {
      const dsUrl = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`;
      const dsResp = await firstValueFrom(
        this.http.get<DexscreenerResponse>(dsUrl),
      );
      if (dsResp?.data) {
        return [{ source: 'dexscreener', raw: dsResp.data }];
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`DexscreenerProvider error for query "${q}": ${msg}`);
    }
    return [];
  }
}
