import { describe, expect, it } from 'vitest';

import type { Pool } from '../src/domain/types.js';
import { QuoteService } from '../src/services/QuoteService.js';

const basePool: Pool = {
  id: 'pool-1',
  dex: 'raydium',
  tokenA: {
    mint: 'token-a',
    symbol: 'A',
    decimals: 6
  },
  tokenB: {
    mint: 'token-b',
    symbol: 'B',
    decimals: 6
  },
  reserveA: '1000',
  reserveB: '1000',
  feeBps: 0,
  lastUpdated: new Date().toISOString(),
  source: {
    programId: 'program-1',
    accounts: ['pool-1']
  }
};

describe('QuoteService', () => {
  const service = new QuoteService();

  it('computes quote for tokenA -> tokenB', () => {
    const quote = service.computeQuote(basePool, '100', 'token-a');

    expect(quote).not.toBeNull();
    expect(quote?.tokenIn).toBe('token-a');
    expect(quote?.tokenOut).toBe('token-b');
    expect(quote?.amountOut).toBe('90');
    expect(quote?.priceImpactPct).toBe('10.00');
  });

  it('computes quote for tokenB -> tokenA', () => {
    const quote = service.computeQuote(basePool, '100', 'token-b');

    expect(quote).not.toBeNull();
    expect(quote?.tokenIn).toBe('token-b');
    expect(quote?.tokenOut).toBe('token-a');
    expect(quote?.amountOut).toBe('90');
    expect(quote?.priceImpactPct).toBe('10.00');
  });
});
