import z from 'zod';

const DEFAULT_PORT = 3000;

const envSchema = z.object({
  PORT: z.coerce.number().default(DEFAULT_PORT),
  DATABASE_URL: z.url({ protocol: /postgres/ }),
});

export const env = envSchema.parse(process.env);
