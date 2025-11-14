import { appBuilder } from './app.ts';
import { env } from './env.ts';

const app = appBuilder({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss.l Z',
        ignore: 'pid',
      },
    },
  },
});

app.listen({ host: env.HOST, port: env.PORT }, (err, _address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
