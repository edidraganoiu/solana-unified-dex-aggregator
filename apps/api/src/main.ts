import { OrcaAdapter } from './adapters/orca/OrcaAdapter.js';
import { RaydiumAdapter } from './adapters/raydium/RaydiumAdapter.js';
import { buildServer } from './server.js';
import { BestRouteService } from './services/BestRouteService.js';
import { PoolIngestionService } from './services/PoolIngestionService.js';
import { QuoteService } from './services/QuoteService.js';
import { PoolStore } from './stores/PoolStore.js';

const poolStore = new PoolStore();
const quoteService = new QuoteService();
const bestRouteService = new BestRouteService(poolStore, quoteService);
const poolIngestionService = new PoolIngestionService(
  [new RaydiumAdapter(), new OrcaAdapter()],
  poolStore
);

await poolIngestionService.refreshAll();
poolIngestionService.start();

const server = buildServer(bestRouteService);
const port = Number(process.env.PORT ?? 3000);

try {
  await server.listen({ port, host: '0.0.0.0' });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
