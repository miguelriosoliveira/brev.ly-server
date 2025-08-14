import type { FastifyInstance } from 'fastify';

export function saveUrlRoutes(app: FastifyInstance) {
  app.post('/urls', (_request, _reply) => {
    return 'hello world';
  });
}
