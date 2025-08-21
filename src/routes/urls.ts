import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import z from 'zod';
import { db } from '../db/index.ts';
import { urlsTable } from '../db/schema.ts';

const requestSchema = z.object({
  Body: z.object({
    original_url: z.url(),
    short_url: z.string(),
  }),
});

type Request = z.infer<typeof requestSchema>;

export function urlsRouter(app: FastifyInstance) {
  app.post<Request>('/', async (request, _reply) => {
    const { original_url, short_url } = request.body;

    try {
      await db.insert(urlsTable).values({ original_url, short_url });
      const [{ id, created_at }] = await db
        .select()
        .from(urlsTable)
        .where(eq(urlsTable.short_url, short_url));
      return { id, created_at };
    } catch (err) {
      app.log.error(err, 'Failed saving URL');
    }
  });
}
