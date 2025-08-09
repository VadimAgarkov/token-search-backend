import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from '../common/cache.service';
import { DexscreenerProvider } from './providers/dexscreener.provider';

@Module({
  imports: [HttpModule],
  controllers: [SearchController],
  providers: [
    CacheService,
    DexscreenerProvider,
    {
      provide: 'SEARCH_PROVIDERS',
      useFactory: (dexscreener: DexscreenerProvider) => [dexscreener],
      inject: [DexscreenerProvider],
    },
    {
      provide: SearchService,
      useFactory: (cache: CacheService, providers: any[]) =>
        new SearchService(cache, providers),
      inject: [CacheService, 'SEARCH_PROVIDERS'],
    },
  ],
})
export class SearchModule {}
