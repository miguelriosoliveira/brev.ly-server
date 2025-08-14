import fastify, { type FastifyServerOptions } from 'fastify';

export function appBuilder(serverOptions: FastifyServerOptions = {}) {
  const app = fastify(serverOptions);

  app.get('/', () => {
    return "I'm healthy";
  });

  return app;
}
