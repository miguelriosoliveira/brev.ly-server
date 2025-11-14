import z from 'zod';

const envSchema = z.object({
  HOST: z.ipv4().default('0.0.0.0'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url({ protocol: /postgres/ }),
  FRONTEND_URL: z.url(),
});

export const env = envSchema.parse(process.env);
