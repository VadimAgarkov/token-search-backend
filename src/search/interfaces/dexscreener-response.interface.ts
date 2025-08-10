export interface DexscreenerResponse {
  pairs: {
    chainId: string;
    dexId: string;
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
    volume: {
      h24: number;
    };
    marketCap: number;
    pairCreatedAt: number | null;
    txns: {
      h24: number;
    };
    priceUsd: number | null;
    priceNative: number | null;
    priceChange: {
      h24: number;
    };
    info: {
      imageUrl?: string;
      socials?: string[];
    };
  }[];
  tokens?: any[];
}
