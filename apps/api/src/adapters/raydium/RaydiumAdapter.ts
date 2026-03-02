import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { Pool, TokenInfo } from '../../domain/types.js';
import { TokenStore } from '../../stores/TokenStore.js';
import { encodeBase58, isValidBase58PublicKey } from '../../utils/base58.js';
import { RpcClient } from '../../utils/rpcClient.js';
import type { DexAdapter } from '../DexAdapter.js';

const POOLS_FILE_PATH = fileURLToPath(new URL('../../../data/pools.raydium.json', import.meta.url));
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const BASE_VAULT_OFFSET = 336;
const QUOTE_VAULT_OFFSET = 368;
const ADDRESS_BYTES = 32;
const RAYDIUM_FEE_BPS = 25;

type RpcAccountInfo = {
  data: [string, string];
  owner: string;
};

type GetMultipleAccountsResult = {
  value: Array<RpcAccountInfo | null>;
};

type TokenBalanceResult = {
  value: {
    amount: string;
  };
};

const resolveToken = (store: TokenStore, mint: string, symbol: string, decimals: number): TokenInfo => {
  return (
    store.getToken(mint) ?? {
      mint,
      symbol,
      decimals
    }
  );
};

export class RaydiumAdapter implements DexAdapter {
  private readonly rpcClient: RpcClient;
  private readonly tokenStore: TokenStore;
  private readonly poolIds: string[];

  constructor(rpcClient = new RpcClient(), tokenStore = new TokenStore()) {
    this.rpcClient = rpcClient;
    this.tokenStore = tokenStore;
    this.poolIds = this.loadPoolIds();
  }

  dexId() {
    return 'raydium' as const;
  }

  async fetchPools(): Promise<Pool[]> {
    if (this.poolIds.length === 0) {
      return [];
    }

    let result: GetMultipleAccountsResult;
    try {
      result = (await this.rpcClient.sendRequest('getMultipleAccounts', [
        this.poolIds,
        { encoding: 'base64' }
      ])) as GetMultipleAccountsResult;
    } catch {
      return [];
    }
    const accounts = result.value ?? [];
    const pools: Pool[] = [];

    for (let index = 0; index < this.poolIds.length; index += 1) {
      const account = accounts[index];
      if (!account?.data?.[0]) {
        continue;
      }

      const raw = Buffer.from(account.data[0], 'base64');
      if (raw.length < QUOTE_VAULT_OFFSET + ADDRESS_BYTES) {
        continue;
      }

      const vaultA = encodeBase58(raw.subarray(BASE_VAULT_OFFSET, BASE_VAULT_OFFSET + ADDRESS_BYTES));
      const vaultB = encodeBase58(raw.subarray(QUOTE_VAULT_OFFSET, QUOTE_VAULT_OFFSET + ADDRESS_BYTES));

      const [reserveA, reserveB] = await Promise.all([
        this.getTokenAccountAmount(vaultA),
        this.getTokenAccountAmount(vaultB)
      ]);

      pools.push({
        id: this.poolIds[index],
        dex: 'raydium',
        tokenA: resolveToken(this.tokenStore, SOL_MINT, 'SOL', 9),
        tokenB: resolveToken(this.tokenStore, USDC_MINT, 'USDC', 6),
        reserveA,
        reserveB,
        feeBps: RAYDIUM_FEE_BPS,
        lastUpdated: new Date().toISOString(),
        source: {
          programId: account.owner,
          accounts: [this.poolIds[index], vaultA, vaultB]
        }
      });
    }

    return pools;
  }

  private loadPoolIds(): string[] {
    const raw = readFileSync(POOLS_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as string[];
    return parsed.filter((poolId) => isValidBase58PublicKey(poolId));
  }

  private async getTokenAccountAmount(tokenAccount: string): Promise<string> {
    const result = (await this.rpcClient.sendRequest('getTokenAccountBalance', [tokenAccount])) as TokenBalanceResult;
    return result.value.amount;
  }
}
