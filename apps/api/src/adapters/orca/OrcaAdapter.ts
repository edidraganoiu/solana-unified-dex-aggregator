import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { Pool, TokenInfo } from '../../domain/types.js';
import { TokenStore } from '../../stores/TokenStore.js';
import { encodeBase58, isValidBase58PublicKey } from '../../utils/base58.js';
import { RpcClient } from '../../utils/rpcClient.js';
import type { DexAdapter } from '../DexAdapter.js';

const POOLS_FILE_PATH = fileURLToPath(new URL('../../../data/pools.orca.json', import.meta.url));
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const TOKEN_A_VAULT_OFFSET = 133;
const TOKEN_B_VAULT_OFFSET = 213;
const FEE_BPS_OFFSET = 45;
const ADDRESS_BYTES = 32;
const DEFAULT_ORCA_FEE_BPS = 30;

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

export class OrcaAdapter implements DexAdapter {
  private readonly rpcClient: RpcClient;
  private readonly tokenStore: TokenStore;
  private readonly poolIds: string[];

  constructor(rpcClient = new RpcClient(), tokenStore = new TokenStore()) {
    this.rpcClient = rpcClient;
    this.tokenStore = tokenStore;
    this.poolIds = this.loadPoolIds();
  }

  dexId() {
    return 'orca' as const;
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
      if (raw.length < TOKEN_B_VAULT_OFFSET + ADDRESS_BYTES) {
        continue;
      }

      const vaultA = encodeBase58(raw.subarray(TOKEN_A_VAULT_OFFSET, TOKEN_A_VAULT_OFFSET + ADDRESS_BYTES));
      const vaultB = encodeBase58(raw.subarray(TOKEN_B_VAULT_OFFSET, TOKEN_B_VAULT_OFFSET + ADDRESS_BYTES));
      const feeFromState = raw.length > FEE_BPS_OFFSET + 1 ? raw.readUInt16LE(FEE_BPS_OFFSET) : 0;

      const [reserveA, reserveB] = await Promise.all([
        this.getTokenAccountAmount(vaultA),
        this.getTokenAccountAmount(vaultB)
      ]);

      pools.push({
        id: this.poolIds[index],
        dex: 'orca',
        tokenA: resolveToken(this.tokenStore, SOL_MINT, 'SOL', 9),
        tokenB: resolveToken(this.tokenStore, USDC_MINT, 'USDC', 6),
        reserveA,
        reserveB,
        feeBps: feeFromState || DEFAULT_ORCA_FEE_BPS,
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
