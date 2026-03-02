import Decimal from 'decimal.js';

import type { Pool, Quote, TokenInfo } from '../domain/types.js';
import { TokenStore } from '../stores/TokenStore.js';
import type { DexAdapter } from '../adapters/DexAdapter.js';
import { QuoteService } from './QuoteService.js';

export class BestRouteService {
  private readonly adapters: DexAdapter[];
  private readonly quoteService: QuoteService;
  private readonly tokenStore: TokenStore;

  constructor(adapters: DexAdapter[], quoteService: QuoteService, tokenStore = new TokenStore()) {
    this.adapters = adapters;
    this.quoteService = quoteService;
    this.tokenStore = tokenStore;
  }

  getTokens(): TokenInfo[] {
    return this.tokenStore.getTokens();
  }

  async getPools(tokenA?: string, tokenB?: string): Promise<Pool[]> {
    const results = await Promise.allSettled(this.adapters.map((adapter) => adapter.fetchPools()));
    const allPools = results
      .filter((result): result is PromiseFulfilledResult<Pool[]> => result.status === 'fulfilled')
      .flatMap((result) => result.value);

    if (!tokenA && !tokenB) {
      return allPools;
    }

    return allPools.filter((pool) => {
      const mints = [pool.tokenA.mint, pool.tokenB.mint];

      if (tokenA && !mints.includes(tokenA)) {
        return false;
      }

      if (tokenB && !mints.includes(tokenB)) {
        return false;
      }

      return true;
    });
  }

  async getQuotes(tokenIn: string, tokenOut: string, amount: string): Promise<Quote[]> {
    const pools = await this.getPools(tokenIn, tokenOut);

    return pools
      .map((pool) => this.quoteService.computeQuote(pool, amount, tokenIn))
      .filter((quote): quote is Quote => quote !== null && quote.tokenOut === tokenOut);
  }

  async getBestRoute(tokenIn: string, tokenOut: string, amount: string): Promise<Quote | null> {
    const quotes = await this.getQuotes(tokenIn, tokenOut, amount);
    if (quotes.length === 0) {
      return null;
    }

    return quotes.sort((a, b) => new Decimal(b.amountOut).cmp(new Decimal(a.amountOut)))[0];
  }
}
