'use client';

import { useMemo, useState } from 'react';

import type { Quote } from '@solana-dex/shared';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const toLamports = (solAmount: string): string => {
  const value = Number(solAmount);
  if (!Number.isFinite(value) || value <= 0) {
    return '0';
  }

  return Math.floor(value * 1_000_000_000).toString();
};

const toUiUsdc = (atomic: string): string => {
  const value = Number(atomic) / 1_000_000;
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

export default function Home() {
  const [amountSol, setAmountSol] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const lamports = useMemo(() => toLamports(amountSol), [amountSol]);

  const onGetBestPrice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/best-route?tokenIn=${SOL_MINT}&tokenOut=${USDC_MINT}&amount=${lamports}`
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as Quote | null;
      setQuote(payload);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unknown error';
      setError(message);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-10">
      <section className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface)]/90 p-8 shadow-[0_12px_48px_rgba(16,24,40,0.12)] backdrop-blur">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Milestone 7</p>
          <h1 className="text-3xl font-semibold">SOL to USDC Quote Dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--muted)]">Token In</span>
            <input
              className="w-full rounded-xl border border-[var(--line)] bg-slate-50 px-3 py-2 font-mono text-sm"
              readOnly
              value={`SOL (${SOL_MINT})`}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-[var(--muted)]">Token Out</span>
            <input
              className="w-full rounded-xl border border-[var(--line)] bg-slate-50 px-3 py-2 font-mono text-sm"
              readOnly
              value={`USDC (${USDC_MINT})`}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--muted)]">Amount In (SOL)</span>
            <input
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2"
              min="0"
              onChange={(event) => setAmountSol(event.target.value)}
              step="0.0001"
              type="number"
              value={amountSol}
            />
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">Lamports: {lamports}</p>
          </label>

          <button
            className="h-11 rounded-xl bg-[var(--accent)] px-6 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || lamports === '0'}
            onClick={onGetBestPrice}
            type="button"
          >
            {loading ? 'Fetching...' : 'Get Best Price'}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-slate-50 p-5">
          <h2 className="mb-4 text-lg font-medium">Result</h2>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {!error && !quote ? (
            <p className="text-sm text-[var(--muted)]">No quote yet. Click the button to fetch best route.</p>
          ) : null}

          {quote ? (
            <div className="grid gap-2 text-sm">
              <p>
                Winning DEX: <span className="font-semibold capitalize">{quote.dex}</span>
              </p>
              <p>
                Output Amount: <span className="font-semibold">{toUiUsdc(quote.amountOut)} USDC</span>
              </p>
              <p>
                Price Impact: <span className="font-semibold">{quote.priceImpactPct}%</span>
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
