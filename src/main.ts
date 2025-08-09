import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from './config';
import { Logger } from './common/logger.service';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, { logger });

  const docConfig = new DocumentBuilder()
    .setTitle('Token Search API')
    .setDescription('MVP: Search tokens by address, pair, or name')
    .setVersion('1.0')
    .addTag('search')
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port);
  logger.log(`Listening on ${config.port}`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap', err);
  process.exit(1);
});
