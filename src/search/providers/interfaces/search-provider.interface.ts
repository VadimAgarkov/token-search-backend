import { SearchResult } from '../../search.service';

export interface ISearchProvider {
  search(q: string, type: 'address' | 'pair' | 'name'): Promise<SearchResult[]>;
}
