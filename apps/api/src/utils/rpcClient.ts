type JsonRpcResponse<T> = {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

const DEFAULT_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export class RpcClient {
  private readonly endpoint: string;

  constructor(endpoint = process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_ENDPOINT) {
    this.endpoint = endpoint;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendRequest(method: string, params: any[]): Promise<unknown> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method,
            params
          })
        });

        if (response.status === 429 || response.status >= 500) {
          if (attempt < MAX_RETRIES) {
            await this.delay(RETRY_DELAY_MS);
            continue;
          }

          throw new Error(`RPC request failed after retries with status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`RPC request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as JsonRpcResponse<unknown>;

        if (payload.error) {
          throw new Error(`RPC error ${payload.error.code}: ${payload.error.message}`);
        }

        return payload.result;
      } catch (error) {
        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS);
          continue;
        }

        const message = error instanceof Error ? error.message : 'Unknown RPC error';
        throw new Error(`RPC request failed after ${MAX_RETRIES} attempts: ${message}`);
      }
    }

    throw new Error('RPC request failed unexpectedly');
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
