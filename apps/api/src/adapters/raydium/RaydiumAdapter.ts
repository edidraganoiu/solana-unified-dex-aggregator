import type { Pool } from '../../domain/types.js';
import type { DexAdapter } from '../DexAdapter.js';

export class RaydiumAdapter implements DexAdapter {
  dexId() {
    return 'raydium' as const;
  }

  async fetchPools(): Promise<Pool[]> {
    return [
      {
        id: 'raydium-sol-usdc-mock-1',
        dex: 'raydium',
        tokenA: {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          decimals: 9
        },
        tokenB: {
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          decimals: 6
        },
        reserveA: '2500',
        reserveB: '375000',
        feeBps: 25,
        tvlUsd: 750000,
        lastUpdated: new Date().toISOString(),
        source: {
          programId: 'RAYDIUM_PROGRAM_MOCK',
          accounts: ['RAYDIUM_POOL_ACCOUNT_MOCK']
        }
      }
    ];
  }
}
