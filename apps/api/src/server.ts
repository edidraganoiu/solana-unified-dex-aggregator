import Fastify from 'fastify';
import { ZodError } from 'zod';

import { registerApiRoutes } from './routes/api.js';
import { registerHomeRoute } from './routes/home.js';
import { BestRouteService } from './services/BestRouteService.js';

export const buildServer = (bestRouteService: BestRouteService) => {
  const server = Fastify({ logger: true });

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
