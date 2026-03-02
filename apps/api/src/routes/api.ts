import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import {
  adminVerifyBodySchema,
  quoteQuerySchema,
  poolsQuerySchema
} from './schemas.js';
import { BestRouteService } from '../services/BestRouteService.js';
import { wrapJsonInHtml } from '../utils/htmlWrapper.js';

const wantsHtml = (request: FastifyRequest): boolean => {
  return request.headers.accept?.includes('text/html') ?? false;
};

const replyWithNegotiation = (
  request: FastifyRequest,
  reply: FastifyReply,
  title: string,
  payload: unknown
) => {
  if (wantsHtml(request)) {
    return reply.type('text/html').send(wrapJsonInHtml(title, payload));
  }

  return payload;
};

export const registerApiRoutes = (
  server: FastifyInstance,
  bestRouteService: BestRouteService,
  adminKey: string
): void => {
  server.get('/health', async (request, reply) => {
    const data = { ok: true };
    return replyWithNegotiation(request, reply, 'Service Health', data);
  });

  server.get('/tokens', async (request, reply) => {
    const data = bestRouteService.getTokens();
    return replyWithNegotiation(request, reply, 'Token Registry', data);
  });

  server.get('/pools', async (request, reply) => {
    const query = poolsQuerySchema.parse(request.query);
    const data = bestRouteService.getPools(query.tokenA, query.tokenB);
    return replyWithNegotiation(request, reply, 'All Cached Pools', data);
  });

  server.get('/price', async (request, reply) => {
    const query = quoteQuerySchema.parse(request.query);
    const data = bestRouteService.getQuotes(query.tokenIn, query.tokenOut, query.amount);
    return replyWithNegotiation(request, reply, 'Price Snapshot', data);
  });

  server.get('/best-route', async (request, reply) => {
    const query = quoteQuerySchema.parse(request.query);
    const data = bestRouteService.getBestRoute(query.tokenIn, query.tokenOut, query.amount);
    return replyWithNegotiation(request, reply, 'Best Route', data);
  });

  server.post('/admin/verify', async (request) => {
    const body = adminVerifyBodySchema.parse(request.body);
    return { valid: body.key === adminKey };
  });
};
