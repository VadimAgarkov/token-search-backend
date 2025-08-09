import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from 'src/common/cache.service';
import { ISearchProvider } from 'src/search/providers/interfaces/search-provider.interface';
import { SearchResult, SearchService } from 'src/search/search.service';

describe('SearchService', () => {
  let service: SearchService;
  let cacheService: CacheService;
  let mockProviders: ISearchProvider[];

  beforeEach(async () => {
    mockProviders = [
      {
        search: jest
          .fn()
          .mockResolvedValue([
            { source: 'provider1', raw: {} },
          ] as SearchResult[]),
      },
      {
        search: jest
          .fn()
          .mockResolvedValue([
            { source: 'provider2', raw: {} },
          ] as SearchResult[]),
      },
    ];

    // Мокаем CacheService с пустыми методами get и set
    const cacheServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CacheService, useValue: cacheServiceMock },
        {
          provide: 'SEARCH_PROVIDERS',
          useValue: mockProviders,
        },
        {
          provide: SearchService,
          useFactory: (cache: CacheService, providers: ISearchProvider[]) =>
            new SearchService(cache, providers),
          inject: [CacheService, 'SEARCH_PROVIDERS'],
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should return cached results if cache hit', async () => {
    const key = 'search:address:testquery';
    const cachedResults: SearchResult[] = [{ source: 'cache', raw: {} }];

    jest.spyOn(cacheService, 'get').mockResolvedValue(cachedResults);

    const res = await service.search('testquery', 'address');

    expect(res.source).toBe('cache');
    expect(res.results).toEqual(cachedResults);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.get).toHaveBeenCalledWith(key);
  });

  it('should call all providers and cache results on cache miss', async () => {
    jest.spyOn(cacheService, 'get').mockResolvedValue(null);
    const setSpy = jest.spyOn(cacheService, 'set').mockResolvedValue();

    const res = await service.search('testquery', 'address');

    expect(res.source).toBe('remote');
    expect(res.results.length).toBe(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockProviders[0].search).toHaveBeenCalledWith(
      'testquery',
      'address',
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockProviders[1].search).toHaveBeenCalledWith(
      'testquery',
      'address',
    );
    expect(setSpy).toHaveBeenCalled();
  });

  it('should return empty array if providers return empty', async () => {
    jest.spyOn(cacheService, 'get').mockResolvedValue(null);
    mockProviders.forEach((p) => (p.search = jest.fn().mockResolvedValue([])));

    const res = await service.search('emptytest', 'name');

    expect(res.source).toBe('remote');
    expect(res.results).toEqual([]);
  });

  it('should handle provider throwing error gracefully', async () => {
    jest.spyOn(cacheService, 'get').mockResolvedValue(null);
    mockProviders[0].search = jest.fn().mockRejectedValue(new Error('fail'));
    mockProviders[1].search = jest
      .fn()
      .mockResolvedValue([{ source: 'ok', raw: {} }]);

    // Чтобы провайдеры не ломали Promise.all, SearchService.search должен ловить ошибки внутри
    // Если сейчас нет обработки ошибок в SearchService, добавим временно тест с try/catch

    const res = await service.search('failtest', 'pair');

    expect(res.source).toBe('remote');
    expect(res.results.length).toBe(1);
    expect(res.results[0].source).toBe('ok');
  });
});
