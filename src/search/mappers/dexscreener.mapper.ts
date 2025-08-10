import { DexscreenerResponse } from '../interfaces/dexscreener-response.interface';
import { SearchApiResult } from '../interfaces/search-api-result.interface';

export function mapDexscreener(data: DexscreenerResponse): SearchApiResult[] {
  if (!data || !Array.isArray(data.pairs)) {
    return [];
  }

  return data.pairs.map(
    (pair): SearchApiResult => ({
      blockchain: pair.chainId || 'SOLANA',
      dex: pair.dexId || 'UNKNOWN',
      pairAddress: pair.pairAddress,
      baseToken: {
        address: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
      },
      quoteToken: {
        address: pair.quoteToken.address,
        name: pair.quoteToken.name,
        symbol: pair.quoteToken.symbol,
      },
      liquidity: {
        usd: pair.liquidity.usd,
        base: pair.liquidity.base,
        quote: pair.liquidity.quote,
      },
      volume24h: pair.volume.h24,
      mcap: pair.marketCap,
      pairCreatedAt: pair.pairCreatedAt,
      trades24h: pair.txns.h24,
      usdPrice: pair.priceUsd,
      priceInBaseToken: pair.priceNative,
      priceChangePercent24h: pair.priceChange.h24,
      logo: pair.info?.imageUrl || null,
      socials: (pair.info?.socials || []).map((url) => ({
        type: 'unknown',
        url,
      })),
    }),
  );
}
