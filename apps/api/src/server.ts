import Fastify from 'fastify';
import { ZodError } from 'zod';

import { OrcaAdapter } from './adapters/orca/OrcaAdapter.js';
import { RaydiumAdapter } from './adapters/raydium/RaydiumAdapter.js';
import { registerApiRoutes } from './routes/api.js';
import { registerHomeRoute } from './routes/home.js';
import { BestRouteService } from './services/BestRouteService.js';
import { QuoteService } from './services/QuoteService.js';

export const buildServer = () => {
  const server = Fastify({ logger: true });

  const quoteService = new QuoteService();
  const bestRouteService = new BestRouteService([new RaydiumAdapter(), new OrcaAdapter()], quoteService);

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

  registerHomeRoute(server);
  registerApiRoutes(server, bestRouteService);

  return server;
};
