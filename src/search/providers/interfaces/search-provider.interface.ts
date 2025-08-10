import { SearchResult } from '../../search.service';

export interface ISearchProvider<T = any> {
  name: string;
  search(
    q: string,
    type: 'address' | 'pair' | 'name',
  ): Promise<SearchResult<T>[]>;
}
