import type { DexId, Pool } from '../domain/types.js';

export interface DexAdapter {
  dexId(): DexId;
  fetchPools(): Promise<Pool[]>;
}
