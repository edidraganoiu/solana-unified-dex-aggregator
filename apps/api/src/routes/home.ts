import type { FastifyInstance } from 'fastify';

import { SOL_MINT, USDC_MINT } from '../config/constants.js';

export const registerHomeRoute = (server: FastifyInstance): void => {
  server.get('/', async (_request, reply) => {
    const pairsQuery = `tokenIn=${SOL_MINT}&tokenOut=${USDC_MINT}&amount=1000000000`;
    const filteredPoolsQuery = `tokenA=${SOL_MINT}&tokenB=${USDC_MINT}`;

    return reply.type('text/html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solana DEX Admin Portal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #070b12;
        --panel: #111827;
        --line: #253041;
        --text: #e5edf9;
        --muted: #8ea0b8;
        --accent: #3b82f6;
        --accent-soft: rgba(59,130,246,0.15);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, Roboto, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at 0% 0%, #172554 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, #052e2b 0%, transparent 42%),
          var(--bg);
      }
      .wrap {
        max-width: 1080px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: end;
        gap: 16px;
        margin-bottom: 24px;
      }
      .title {
        margin: 0;
        font-size: clamp(1.5rem, 3vw, 2.2rem);
        font-weight: 700;
      }
      .sub {
        margin: 6px 0 0;
        color: var(--muted);
      }
      .badge {
        border: 1px solid var(--line);
        background: rgba(17, 24, 39, 0.7);
        border-radius: 999px;
        padding: 8px 12px;
        color: #93c5fd;
        font-size: 0.85rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 14px;
      }
      .card {
        display: block;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 16px;
        color: inherit;
        text-decoration: none;
        background: linear-gradient(160deg, rgba(17,24,39,0.9), rgba(8,14,24,0.92));
        transition: transform .15s ease, border-color .15s ease, background .15s ease;
      }
      .card:hover {
        transform: translateY(-2px);
        border-color: #3b82f6;
        background: linear-gradient(160deg, rgba(30,41,59,0.95), rgba(8,14,24,0.95));
      }
      .card h3 {
        margin: 0 0 8px;
        font-size: 1rem;
      }
      .card p {
        margin: 0;
        color: var(--muted);
        font-size: 0.9rem;
        line-height: 1.45;
      }
      .mono {
        margin-top: 10px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.78rem;
        color: #a5b4fc;
        word-break: break-all;
      }
      .panel {
        margin-top: 18px;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 16px;
        background: rgba(15, 23, 42, 0.7);
      }
      .panel h4 {
        margin: 0 0 8px;
        font-size: 0.95rem;
      }
      .panel p {
        margin: 0;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <header class="head">
        <div>
          <h1 class="title">Solana DEX Aggregator Admin Portal</h1>
          <p class="sub">Operational links for pool snapshots, quotes, and route decisions.</p>
        </div>
        <div class="badge">Fastify API • Mainnet RPC</div>
      </header>

      <section class="grid">
        <a class="card" href="/health">
          <h3>Service Health</h3>
          <p>Probe liveness and verify API is accepting requests.</p>
          <div class="mono">GET /health</div>
        </a>

        <a class="card" href="/tokens">
          <h3>Token Registry</h3>
          <p>View supported token mints and decimals from local metadata.</p>
          <div class="mono">GET /tokens</div>
        </a>

        <a class="card" href="/pools">
          <h3>All Cached Pools</h3>
          <p>Inspect current in-memory pool cache from Raydium + Orca adapters.</p>
          <div class="mono">GET /pools</div>
        </a>

        <a class="card" href="/pools?${filteredPoolsQuery}">
          <h3>SOL/USDC Pools</h3>
          <p>Filter cache to SOL/USDC pair for focused routing diagnostics.</p>
          <div class="mono">GET /pools?${filteredPoolsQuery}</div>
        </a>

        <a class="card" href="/price?${pairsQuery}">
          <h3>Price Snapshot</h3>
          <p>Compute per-pool quote and price impact for 1 SOL in lamports.</p>
          <div class="mono">GET /price?${pairsQuery}</div>
        </a>

        <a class="card" href="/best-route?${pairsQuery}">
          <h3>Best Route</h3>
          <p>Return highest output route currently available in the cache.</p>
          <div class="mono">GET /best-route?${pairsQuery}</div>
        </a>
      </section>

      <section class="panel">
        <h4>Admin Verification Endpoint</h4>
        <p>POST /admin/verify accepts { key } and validates against the in-memory startup key.</p>
      </section>
    </main>
  </body>
</html>`);
  });
};
