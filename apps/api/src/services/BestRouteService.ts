import Decimal from 'decimal.js';

import type { Pool, Quote, TokenInfo } from '../domain/types.js';
import { PoolStore } from '../stores/PoolStore.js';
import { TokenStore } from '../stores/TokenStore.js';
import { QuoteService } from './QuoteService.js';

export class BestRouteService {
  private readonly poolStore: PoolStore;
  private readonly quoteService: QuoteService;
  private readonly tokenStore: TokenStore;

  constructor(poolStore: PoolStore, quoteService: QuoteService, tokenStore = new TokenStore()) {
    this.poolStore = poolStore;
    this.quoteService = quoteService;
    this.tokenStore = tokenStore;
  }

  getTokens(): TokenInfo[] {
    return this.tokenStore.getTokens();
  }

  getPools(tokenA?: string, tokenB?: string): Pool[] {
    return this.poolStore.getPools(tokenA, tokenB);
  }

  getQuotes(tokenIn: string, tokenOut: string, amount: string): Quote[] {
    const pools = this.getPools(tokenIn, tokenOut);

    return pools
      .map((pool) => this.quoteService.computeQuote(pool, amount, tokenIn))
      .filter((quote): quote is Quote => quote !== null && quote.tokenOut === tokenOut);
  }

  getBestRoute(tokenIn: string, tokenOut: string, amount: string): Quote | null {
    const quotes = this.getQuotes(tokenIn, tokenOut, amount);
    if (quotes.length === 0) {
      return null;
    }

    return quotes.sort((a, b) => new Decimal(b.amountOut).cmp(new Decimal(a.amountOut)))[0];
  }
}
