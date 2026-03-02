# Solana Unified DEX Aggregator

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-API-000000?logo=fastify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?logo=pnpm&logoColor=white)

A high-performance monorepo API and Web UI that aggregates live liquidity pools from Raydium and Orca to find optimal swap routes in real time on Solana.

## Project Outcomes
- Cache-first quote API architecture that avoids direct Solana RPC calls on each user request
- Low-latency local responses from in-memory pool snapshots
- Adapter-driven routing engine that unifies Raydium and Orca under one quoting interface

## Features
- Unified pool model across multiple DEX adapters
- In-memory cache with background refresh loop
- Quote engine with fee and price impact calculations
- Best-route selection from all available quotes
- Browser-friendly API responses for direct admin usage
- Dark-mode frontend dashboard with market view and admin verification

## Technology Stack
- Monorepo: pnpm workspaces (Turborepo-ready structure)
- Frontend: Next.js (App Router), Tailwind CSS
- Backend: Fastify, Zod, Decimal.js
- Language: TypeScript

## Architecture Overview
The backend is designed for real-time routing without issuing expensive RPC calls per request:

1. PoolIngestionService pulls pool state from Raydium and Orca adapters.
2. Data is normalized into a shared `Pool` schema and stored in PoolStore (in-memory cache).
3. A background interval refreshes cache data periodically.
4. QuoteService computes quotes using constant-product AMM math (`x*y=k`) with fees and price impact.
5. BestRouteService ranks quotes and returns the highest-output route.

This approach keeps API responses fast and resilient to Solana RPC rate limits.

## Repository Structure
```text
apps/
  api/    # Fastify backend + adapters + quote engine + cache refresh loop
  web/    # Next.js dashboard
packages/
  shared/ # Shared types/contracts (Pool, Quote, etc.)
```

## API Documentation
Base URL (local): `http://localhost:3000`

### Core Endpoints
- `GET /health`
- `GET /tokens`
- `GET /pools?tokenA=<mint>&tokenB=<mint>`
- `GET /price?tokenIn=<mint>&tokenOut=<mint>&amount=<atomic>`
- `GET /best-route?tokenIn=<mint>&tokenOut=<mint>&amount=<atomic>`
- `POST /admin/verify` with body `{ "key": "..." }`

### Example Requests
```bash
curl "http://localhost:3000/health"
curl "http://localhost:3000/pools"
curl "http://localhost:3000/price?tokenIn=So11111111111111111111111111111111111111112&tokenOut=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000"
curl "http://localhost:3000/best-route?tokenIn=So11111111111111111111111111111111111111112&tokenOut=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000"
```

## Getting Started
### 1. Install dependencies
```bash
pnpm install
```

### 2. Start API
```bash
export NODE_TLS_REJECT_UNAUTHORIZED="0"
PORT=3000 pnpm --filter @apps/api dev
```

### 3. Start Web (new terminal)
```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000" pnpm --filter @apps/web dev
```

### 4. Open applications
- Web UI: `http://localhost:3001`
- Admin/API portal: `http://localhost:3000`

## Extensibility
The aggregation engine uses the Adapter Pattern.

To add a new DEX:
1. Implement the `DexAdapter` contract and return normalized `Pool[]` from `fetchPools()`.
2. Map protocol-specific fees and reserves into the shared schema.
3. Register the new adapter instance in the bootstrap adapter list (currently wired into `PoolIngestionService` in `apps/api/src/main.ts`).

Once added, the new DEX is automatically included in cached pools, quote generation, and best-route selection.

## Limitations and Assumptions
- Routing is currently single-hop (tokenIn -> tokenOut), not multi-hop
- Quote math uses constant-product approximation and is intended for routing insight, not transaction execution
- `amount` query parameters are atomic units (for SOL: lamports)
- Admin key is generated at server startup and stored in memory only
- Pool ingestion currently relies on curated pool IDs and parser offsets for supported protocols

## Docker (Local Development)
Use `docker-compose.yml` to run API and web in local development mode.

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Web: `http://localhost:3001`

## Testing and Quality
Run the following checks before pushing changes:

```bash
pnpm lint
pnpm test
pnpm --filter @apps/web build
```

Current automated coverage focuses on quote engine correctness and monorepo-level lint/test integrity.

## Resume-Ready Highlights
- Designed and implemented an adapter-based Solana DEX aggregation architecture in a TypeScript monorepo
- Built a background ingestion and in-memory caching pipeline to reduce RPC pressure and improve API responsiveness
- Delivered a production-style Fastify API and Next.js dashboard with route transparency, DEX filtering, and admin verification
