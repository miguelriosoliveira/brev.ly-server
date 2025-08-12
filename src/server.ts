import fastify from 'fastify';
import { env } from './env.ts';

const server = fastify({ logger: true });

server.get('/', () => {
  return "I'm healthy";
});

async function start() {
  try {
    await server.listen({ port: env.PORT });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
