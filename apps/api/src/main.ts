import Fastify from 'fastify';
import { ZodError, z } from 'zod';

import { OrcaAdapter } from './adapters/orca/OrcaAdapter.js';
import { RaydiumAdapter } from './adapters/raydium/RaydiumAdapter.js';
import { QuoteService } from './services/QuoteService.js';
import { BestRouteService } from './services/BestRouteService.js';

const server = Fastify({ logger: true });

const quoteService = new QuoteService();
const bestRouteService = new BestRouteService([new RaydiumAdapter(), new OrcaAdapter()], quoteService);
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const poolsQuerySchema = z.object({
  tokenA: z.string().min(1).optional(),
  tokenB: z.string().min(1).optional()
});

const quoteQuerySchema = z.object({
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amount: z.string().min(1)
});

server.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');
    return reply.status(400).send({
      error: {
        code: 'BAD_REQUEST',
        message: message || 'Invalid request parameters'
      }
    });
  }

  server.log.error(error);
  return reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

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

server.get('/health', async () => {
  return { ok: true };
});

server.get('/tokens', async () => {
  return bestRouteService.getTokens();
});

server.get('/pools', async (request) => {
  const query = poolsQuerySchema.parse(request.query);
  return bestRouteService.getPools(query.tokenA, query.tokenB);
});

server.get('/price', async (request) => {
  const query = quoteQuerySchema.parse(request.query);
  return bestRouteService.getQuotes(query.tokenIn, query.tokenOut, query.amount);
});

server.get('/best-route', async (request) => {
  const query = quoteQuerySchema.parse(request.query);
  return bestRouteService.getBestRoute(query.tokenIn, query.tokenOut, query.amount);
});

const port = Number(process.env.PORT ?? 3000);

try {
  await server.listen({ port, host: '0.0.0.0' });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
