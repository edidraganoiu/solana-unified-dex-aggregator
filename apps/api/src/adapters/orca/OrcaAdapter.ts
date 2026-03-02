import type { Pool } from '../../domain/types.js';
import type { DexAdapter } from '../DexAdapter.js';

export class OrcaAdapter implements DexAdapter {
  dexId() {
    return 'orca' as const;
  }

  async fetchPools(): Promise<Pool[]> {
    return [
      {
        id: 'orca-sol-usdc-mock-1',
        dex: 'orca',
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
        reserveA: '1800',
        reserveB: '270000',
        feeBps: 30,
        tvlUsd: 540000,
        lastUpdated: new Date().toISOString(),
        source: {
          programId: 'ORCA_PROGRAM_MOCK',
          accounts: ['ORCA_POOL_ACCOUNT_MOCK']
        }
      }
    ];
  }
}
