import Decimal from 'decimal.js';

import type { Pool, Quote } from '../domain/types.js';

export class QuoteService {
  computeQuote(pool: Pool, amountInAtomic: string, tokenInMint: string): Quote | null {
    const amountIn = new Decimal(amountInAtomic);
    if (amountIn.lte(0)) {
      return null;
    }

    const isTokenAIn = tokenInMint === pool.tokenA.mint;
    const isTokenBIn = tokenInMint === pool.tokenB.mint;

    if (!isTokenAIn && !isTokenBIn) {
      return null;
    }

    const reserveA = new Decimal(pool.reserveA);
    const reserveB = new Decimal(pool.reserveB);

    if (reserveA.lte(0) || reserveB.lte(0)) {
      return null;
    }

    const reserveIn = isTokenAIn ? reserveA : reserveB;
    const reserveOut = isTokenAIn ? reserveB : reserveA;
    const tokenOutMint = isTokenAIn ? pool.tokenB.mint : pool.tokenA.mint;

    const feeAmount = amountIn.mul(pool.feeBps).div(10_000);
    const amountInNet = amountIn.sub(feeAmount);

    if (amountInNet.lte(0)) {
      return null;
    }

    const amountOut = reserveOut.mul(amountInNet).div(reserveIn.add(amountInNet)).floor();

    const spotPrice = reserveOut.div(reserveIn);
    const effectivePrice = amountOut.div(amountIn);
    const priceImpactPct = new Decimal(1).sub(effectivePrice.div(spotPrice)).mul(100);

    return {
      dex: pool.dex,
      poolId: pool.id,
      tokenIn: tokenInMint,
      tokenOut: tokenOutMint,
      amountIn: amountIn.toFixed(0),
      amountOut: amountOut.toFixed(0),
      price: effectivePrice.toString(),
      feeBps: pool.feeBps,
      priceImpactPct: priceImpactPct.toDecimalPlaces(2).toFixed(2),
      timestamp: new Date().toISOString()
    };
  }
}
