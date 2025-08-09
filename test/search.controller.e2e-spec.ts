import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('SearchController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 if query "q" is missing', () => {
    return request(app.getHttpServer())
      .get('/search')
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('q required');
      });
  });

  it('should return search results for valid query and type', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get('/search')
      .query({
        q: '0x0000000000000000000000000000000000000000',
        type: 'address',
      })
      .expect(200);

    expect(res.body).toHaveProperty('source');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(['cache', 'remote']).toContain(res.body.source);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it('should accept query without type and infer type', async () => {
    const res = await request(app.getHttpServer())
      .get('/search')
      .query({ q: 'uniswap' })
      .expect(200);

    expect(res.body).toHaveProperty('source');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});
