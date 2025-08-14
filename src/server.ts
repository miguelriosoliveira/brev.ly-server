import { appBuilder } from './app.ts';
import { env } from './env.ts';
import { saveUrlRoutes } from './routes/save-url.ts';

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

app.register(saveUrlRoutes);

app.listen({ port: env.PORT }, (err, _address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
