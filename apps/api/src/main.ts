import { buildServer } from './server.js';

const server = buildServer();
const port = Number(process.env.PORT ?? 3000);

try {
  await server.listen({ port, host: '0.0.0.0' });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
