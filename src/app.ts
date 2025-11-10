import cors from '@fastify/cors';
import fastify, { type FastifyServerOptions } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './env.ts';
import { downloadsRouter } from './routes/download.ts';
import { urlsRouter } from './routes/urls.ts';

export function appBuilder(serverOptions?: FastifyServerOptions) {
  const app = fastify(serverOptions);

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    origin: [env.FRONTEND_URL],
    exposedHeaders: ['content-disposition'],
    methods: ['GET', 'POST', 'DELETE'],
  });
  app.register(downloadsRouter, { prefix: '/downloads' });
  app.register(urlsRouter, { prefix: '/urls' });

  return app;
}
