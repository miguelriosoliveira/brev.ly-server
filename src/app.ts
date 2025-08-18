import fastify, { type FastifyServerOptions } from 'fastify';
import { healthCheckRouter } from './routes/health-check.ts';
import { urlsRouter } from './routes/urls.ts';

export function appBuilder(serverOptions?: FastifyServerOptions) {
  const app = fastify({
    ignoreTrailingSlash: true, // Accepts both `/path` and `/path/`
    ...(serverOptions ?? {}),
  });

  app.register(healthCheckRouter, { prefix: '/health' });
  app.register(urlsRouter, { prefix: '/urls' });

  return app;
}
