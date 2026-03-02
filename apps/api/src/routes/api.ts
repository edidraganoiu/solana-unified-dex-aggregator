import type { FastifyInstance } from 'fastify';

import {
  adminVerifyBodySchema,
  quoteQuerySchema,
  poolsQuerySchema
} from './schemas.js';
import { BestRouteService } from '../services/BestRouteService.js';

export const registerApiRoutes = (
  server: FastifyInstance,
  bestRouteService: BestRouteService,
  adminKey: string
): void => {
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

  server.post('/admin/verify', async (request) => {
    const body = adminVerifyBodySchema.parse(request.body);
    return { valid: body.key === adminKey };
  });
};
