import type { FastifyInstance } from 'fastify';

import { SOL_MINT, USDC_MINT } from '../config/constants.js';

export const registerHomeRoute = (server: FastifyInstance): void => {
  server.get('/', async (_request, reply) => {
    const pairsQuery = `tokenIn=${SOL_MINT}&tokenOut=${USDC_MINT}&amount=1`;
    const filteredPoolsQuery = `tokenA=${SOL_MINT}&tokenB=${USDC_MINT}`;

    return reply.type('text/html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solana DEX API</title>
    <style>
      body { font-family: sans-serif; padding: 24px; background: #f6f7fb; }
      h1 { margin-bottom: 16px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; max-width: 900px; }
      a { text-decoration: none; }
      button { width: 100%; padding: 12px 14px; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; cursor: pointer; text-align: left; }
      button:hover { background: #f0f4ff; }
      code { display: block; margin-top: 6px; font-size: 12px; color: #475467; word-break: break-all; }
    </style>
  </head>
  <body>
    <h1>Solana DEX Aggregator API</h1>
    <div class="grid">
      <a href="/health"><button>Health<code>/health</code></button></a>
      <a href="/tokens"><button>Tokens<code>/tokens</code></button></a>
      <a href="/pools"><button>All Pools<code>/pools</code></button></a>
      <a href="/pools?${filteredPoolsQuery}"><button>SOL/USDC Pools<code>/pools?${filteredPoolsQuery}</code></button></a>
      <a href="/price?${pairsQuery}"><button>Price (SOL→USDC)<code>/price?${pairsQuery}</code></button></a>
      <a href="/best-route?${pairsQuery}"><button>Best Route (SOL→USDC)<code>/best-route?${pairsQuery}</code></button></a>
    </div>
  </body>
</html>`);
  });
};
