import { SearchApiResult } from './search-api-result.interface';

export interface ISearchProvider {
  name: string;
  search(
    q: string,
    type: 'address' | 'pair' | 'name',
  ): Promise<SearchApiResult[]>;
}
