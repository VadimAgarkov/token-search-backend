import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from './common/cache.service';
import { Logger } from './common/logger.service';
import { SearchModule } from './search/search.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [HttpModule, SearchModule, PrometheusModule.register()],
  providers: [CacheService, Logger],
  exports: [CacheService],
})
export class AppModule {}
