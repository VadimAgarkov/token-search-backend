import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { DexscreenerProvider } from './providers/dexscreener.provider';
import { HttpModule, HttpService } from '@nestjs/axios';

describe('DexscreenerProvider', () => {
  let provider: DexscreenerProvider;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DexscreenerProvider],
      imports: [HttpModule],
    }).compile();

    provider = module.get<DexscreenerProvider>(DexscreenerProvider);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return data on successful http call', async () => {
    const fakeConfig: InternalAxiosRequestConfig = {
      headers: new AxiosHeaders(),
      method: 'GET',
      url: '',
      baseURL: '',
      transformRequest: [],
      transformResponse: [],
      timeout: 0,
      adapter: undefined,
      xsrfCookieName: '',
      xsrfHeaderName: '',
      maxContentLength: -1,
      maxBodyLength: -1,
      validateStatus: () => true,
    };

    const fakeResponse: AxiosResponse = {
      data: { pairs: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: fakeConfig,
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(fakeResponse));

    const results = await provider.search('query', 'address');
    expect(results).toEqual([
      { source: 'dexscreener', raw: fakeResponse.data },
    ]);
  });

  it('should return empty array on error', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw new Error('fail');
    });

    const results = await provider.search('query', 'address');
    expect(results).toEqual([]);
  });
});
