'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Quote } from '@solana-dex/shared';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

type VerifyResponse = {
  valid: boolean;
};

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

const toUsd = (value: number | null): string => {
  if (value === null) {
    return '--';
  }

  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export default function Home() {
  const [amountSol, setAmountSol] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const [solUsd, setSolUsd] = useState<number | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const lamports = useMemo(() => toLamports(amountSol), [amountSol]);

  useEffect(() => {
    let isMounted = true;

    const loadMarket = async () => {
      setMarketLoading(true);
      setMarketError(null);

      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );

        if (!response.ok) {
          throw new Error(`CoinGecko request failed with ${response.status}`);
        }

        const data = (await response.json()) as { solana?: { usd?: number } };
        const price = data.solana?.usd;

        if (!isMounted) {
          return;
        }

        if (typeof price === 'number') {
          setSolUsd(price);
        } else {
          setMarketError('Live price is unavailable right now');
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Failed loading market data';
        setMarketError(message);
      } finally {
        if (isMounted) {
          setMarketLoading(false);
        }
      }
    };

    void loadMarket();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const onVerifyAdmin = async () => {
    setAdminLoading(true);
    setAdminError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ key: adminKey })
      });

      if (!response.ok) {
        throw new Error(`Admin verify failed with ${response.status}`);
      }

      const data = (await response.json()) as VerifyResponse;
      if (!data.valid) {
        setAdminError('Invalid admin key');
        return;
      }

      window.open(`${API_BASE_URL}/`, '_blank', 'noopener,noreferrer');
      setIsAdminModalOpen(false);
      setAdminKey('');
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Admin verification failed';
      setAdminError(message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(58,123,255,0.3),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(32,212,169,0.22),transparent_68%)] blur-2xl" />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">DEX Intelligence</p>
          <h1 className="mt-1 text-3xl font-semibold">SOL to USDC Quote Dashboard</h1>
        </div>
        <button
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] backdrop-blur transition hover:border-[var(--accent)] hover:shadow-[0_0_18px_rgba(58,123,255,0.25)]"
          onClick={() => {
            setAdminError(null);
            setIsAdminModalOpen(true);
          }}
          type="button"
        >
          Admin
        </button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_18px_48px_rgba(2,8,23,0.5)] backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Token In</span>
              <input
                className="w-full rounded-xl border border-[var(--line-soft)] bg-[var(--surface-2)] px-3 py-2 font-semibold text-[var(--text)]"
                readOnly
                value="SOL"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Token Out</span>
              <input
                className="w-full rounded-xl border border-[var(--line-soft)] bg-[var(--surface-2)] px-3 py-2 font-semibold text-[var(--text)]"
                readOnly
                value="USDC"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--muted)]">Amount In (SOL)</span>
              <input
                className="w-full rounded-xl border border-[var(--line-soft)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)]"
                min="0"
                onChange={(event) => setAmountSol(event.target.value)}
                step="0.0001"
                type="number"
                value={amountSol}
              />
              <p className="mt-1 font-mono text-xs text-[var(--muted)]">Lamports: {lamports}</p>
            </label>

            <button
              className="h-11 rounded-xl bg-[linear-gradient(120deg,var(--accent),#245de3)] px-6 font-medium text-white transition hover:brightness-110 hover:shadow-[0_0_18px_rgba(58,123,255,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || lamports === '0'}
              onClick={onGetBestPrice}
              type="button"
            >
              {loading ? 'Fetching...' : 'Get Best Price'}
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-2)] p-5">
            <h2 className="mb-4 text-lg font-medium text-[var(--text)]">Result</h2>

            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

            {!error && !quote ? (
              <p className="text-sm text-[var(--muted)]">No quote yet. Click the button to fetch best route.</p>
            ) : null}

            {quote ? (
              <div className="grid gap-2 text-sm text-[var(--text)]">
                <p>
                  Winning DEX: <span className="font-semibold capitalize text-[var(--accent-2)]">{quote.dex}</span>
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
        </div>

        <aside className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_18px_48px_rgba(2,8,23,0.5)] backdrop-blur">
          <h2 className="text-xl font-semibold text-[var(--text)]">Live Market Overview</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">CoinGecko real-time snapshot</p>

          <div className="mt-6 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-2)] p-5">
            <p className="text-sm text-[var(--muted)]">SOL / USD</p>
            <p className="mt-2 text-4xl font-semibold text-[var(--accent-2)]">
              {marketLoading ? 'Loading...' : toUsd(solUsd)}
            </p>
            {marketError ? <p className="mt-3 text-xs text-[var(--danger)]">{marketError}</p> : null}
          </div>
        </aside>
      </section>

      {isAdminModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--text)]">Admin Access</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">Enter startup admin key to open backend portal.</p>

            <label className="mt-4 block text-sm text-[var(--muted)]">
              Admin Key
              <input
                className="mt-2 w-full rounded-xl border border-[var(--line-soft)] bg-[#0b1222] px-3 py-2 font-mono text-[var(--text)]"
                onChange={(event) => setAdminKey(event.target.value)}
                type="password"
                value={adminKey}
              />
            </label>

            {adminError ? <p className="mt-3 text-sm text-[var(--danger)]">{adminError}</p> : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm text-[var(--text)]"
                onClick={() => setIsAdminModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-[linear-gradient(120deg,var(--accent),#245de3)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={adminLoading || adminKey.trim().length === 0}
                onClick={onVerifyAdmin}
                type="button"
              >
                {adminLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
