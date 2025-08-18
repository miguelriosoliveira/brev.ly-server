import type { FastifyInstance } from 'fastify';

export function healthCheckRouter(app: FastifyInstance) {
  app.get('/', () => "I'm healthy");
}
