import { Test, TestingModule } from '@nestjs/testing';
import { SearchService, SearchResult } from '../src/search/search.service';
import { CacheService } from '../src/common/cache.service';
import { Logger } from '@nestjs/common';
import { ISearchProvider } from './providers/interfaces/search-provider.interface';

describe('SearchService', () => {
  let service: SearchService;
  // let cacheService: CacheService;
  let providers: ISearchProvider[];

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    providers = [
      {
        name: 'Dexscreener',
        search: jest.fn(),
      },
      {
        name: 'OtherProvider',
        search: jest.fn(),
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CacheService, useValue: mockCache },
        { provide: Logger, useValue: mockLogger },

        // Регистрируем токен SEARCH_PROVIDERS и передаём массив провайдеров
        { provide: 'SEARCH_PROVIDERS', useValue: providers },

        // Создаём SearchService через фабрику, чтобы Nest знал как инжектить зависимости
        {
          provide: SearchService,
          useFactory: (
            cacheService: CacheService,
            searchProviders: ISearchProvider[],
          ) => {
            return new SearchService(cacheService, searchProviders);
          },
          inject: [CacheService, 'SEARCH_PROVIDERS'],
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached results if present', async () => {
    mockCache.get.mockResolvedValue([{ id: 'cached' }]);

    const result = await service.search('query', 'address');

    expect(mockCache.get).toHaveBeenCalledWith('search:address:query');
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Cache hit for key search:address:query',
    );
    expect(result.source).toBe('cache');
    expect(result.results).toEqual([{ id: 'cached' }]);
  });

  it('should query providers and cache results on cache miss', async () => {
    mockCache.get.mockResolvedValue(null);
    const providerResults: SearchResult[] = [
      {
        source: 'Dexscreener',
        raw: {
          /* some data */
        },
      },
    ];
    // Мокаем search у Dexscreener
    providers[0].search.mockResolvedValue(providerResults);
    // Другой провайдер возвращает пустой массив
    providers[1].search.mockResolvedValue([]);

    // Нужно также замокать mapDexscreener, если используется. Для упрощения допустим, что он просто возвращает []
    // Или можно подменить на jest.fn(), если он импортируется из модуля

    const results = await service.search('query', 'address');

    expect(mockCache.get).toHaveBeenCalled();
    expect(providers[0].search).toHaveBeenCalledWith('query', 'address');
    expect(providers[1].search).toHaveBeenCalledWith('query', 'address');
    expect(mockCache.set).toHaveBeenCalled();
    expect(results.source).toBe('remote');
  });

  it('should increment error counter and log error if provider fails', async () => {
    mockCache.get.mockResolvedValue(null);
    providers[0].search.mockRejectedValue(new Error('Provider error'));
    providers[1].search.mockResolvedValue([]);

    await expect(service.search('query', 'address')).resolves.toBeDefined();

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Provider Dexscreener failed: Provider error',
    );
  });

  it('should throw error if unexpected error occurs', async () => {
    mockCache.get.mockRejectedValue(new Error('Cache error'));

    await expect(service.search('query', 'address')).rejects.toThrow(
      'Cache error',
    );

    expect(mockLogger.error).toHaveBeenCalledWith('Cache error');
  });
});
