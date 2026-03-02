import type { Pool } from '../domain/types.js';

export class PoolStore {
  private pools: Pool[] = [];

  getPools(tokenA?: string, tokenB?: string): Pool[] {
    if (!tokenA && !tokenB) {
      return this.pools;
    }

    return this.pools.filter((pool) => {
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

  setPools(pools: Pool[]): void {
    this.pools = pools;
  }
}
