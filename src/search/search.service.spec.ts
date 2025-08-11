import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { CacheService } from '../common/cache.service';
import { ISearchProvider } from './providers/interfaces/search-provider.interface';

describe('SearchService', () => {
  let service: SearchService;
  let cacheService: CacheService;
  let mockProvider: ISearchProvider;

  beforeEach(async () => {
    mockProvider = {
      name: 'Dexscreener',
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: 'SEARCH_PROVIDERS',
          useValue: [mockProvider],
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cached results if cache hit', async () => {
    const cacheResult = [{ id: 1 }];
    jest.spyOn(cacheService, 'get').mockResolvedValue(cacheResult);

    const result = await service.search('test', 'address');

    expect(cacheService.get).toHaveBeenCalled();
    expect(result.source).toBe('cache');
    expect(result.results).toBe(cacheResult);
  });

  it('should fetch from provider and cache if cache miss', async () => {
    jest.spyOn(cacheService, 'get').mockResolvedValue(undefined);
    const providerResult = [{ source: 'dexscreener', raw: { pairs: [] } }];
    (mockProvider.search as jest.Mock).mockResolvedValue(providerResult);
    jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);

    const result = await service.search('test', 'address');

    expect(mockProvider.search).toHaveBeenCalledWith('test', 'address');
    expect(cacheService.set).toHaveBeenCalled();
    expect(result.source).toBe('remote');
  });

  it('should handle provider error gracefully', async () => {
    jest.spyOn(cacheService, 'get').mockResolvedValue(undefined);
    (mockProvider.search as jest.Mock).mockRejectedValue(new Error('fail'));
    jest.spyOn(cacheService, 'set').mockResolvedValue(undefined);

    const result = await service.search('test', 'address');

    expect(result.results).toEqual([]);
  });
});
