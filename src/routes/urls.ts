import type { FastifyInstance } from 'fastify';

export function urlsRouter(app: FastifyInstance) {
  app.post('/', () => 'hello world');
}
