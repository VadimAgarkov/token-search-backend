import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from './common/cache.service';
import { Logger } from './common/logger.service';
import { SearchModule } from './search/search.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { PrometheusController } from './prometheus/prometheus.controller';

@Module({
  imports: [
    HttpModule,
    SearchModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [CacheService, Logger],
  exports: [CacheService],
  controllers: [PrometheusController],
})
export class AppModule {}
