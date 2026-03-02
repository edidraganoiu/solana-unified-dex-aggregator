export type DexId = 'raydium' | 'orca';

export type TokenInfo = {
  mint: string;
  symbol?: string;
  decimals: number;
};

export type Pool = {
  id: string;
  dex: DexId;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  reserveA: string;
  reserveB: string;
  feeBps: number;
  tvlUsd?: number;
  lastUpdated: string;
  source: {
    programId: string;
    accounts: string[];
  };
};
