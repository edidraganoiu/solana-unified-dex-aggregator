import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { TokenInfo } from '@solana-dex/shared';

const TOKENS_FILE_PATH = fileURLToPath(new URL('../../data/tokens.json', import.meta.url));

export class TokenStore {
  private readonly tokensByMint: Map<string, TokenInfo>;

  constructor() {
    this.tokensByMint = this.loadTokens();
  }

  getToken(mint: string): TokenInfo | undefined {
    return this.tokensByMint.get(mint);
  }

  getTokens(): TokenInfo[] {
    return Array.from(this.tokensByMint.values());
  }

  private loadTokens(): Map<string, TokenInfo> {
    const raw = readFileSync(TOKENS_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as TokenInfo[];

    return new Map(parsed.map((token) => [token.mint, token]));
  }
}
