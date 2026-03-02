import type { DexAdapter } from '../adapters/DexAdapter.js';
import { PoolStore } from '../stores/PoolStore.js';

export class PoolIngestionService {
  private readonly adapters: DexAdapter[];
  private readonly poolStore: PoolStore;

  constructor(adapters: DexAdapter[], poolStore: PoolStore) {
    this.adapters = adapters;
    this.poolStore = poolStore;
  }

  async refreshAll(): Promise<void> {
    const results = await Promise.allSettled(this.adapters.map((adapter) => adapter.fetchPools()));

    const pools = results
      .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<DexAdapter['fetchPools']>>> => result.status === 'fulfilled')
      .flatMap((result) => result.value);

    this.poolStore.setPools(pools);
  }

  start(intervalMs = 10_000): NodeJS.Timeout {
    return setInterval(() => {
      void this.refreshAll();
    }, intervalMs);
  }
}
