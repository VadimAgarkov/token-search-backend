export interface SearchApiResult {
  blockchain: string;
  dex: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  volume24h: number;
  mcap: number;
  pairCreatedAt: number | null;
  trades24h: number;
  usdPrice: number | null;
  priceInBaseToken: number | null;
  priceChangePercent24h: number;
  logo: string | null;
  socials: { type: string; url: string }[];
}
