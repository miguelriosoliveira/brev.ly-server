import { constants as HttpStatus } from 'node:http2';
import { desc, eq, lte } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../db/index.ts';
import { urlsTable } from '../db/schema.ts';
import { ERROR_SCHEMA, ErrorCodes } from '../errors/error-codes.ts';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_SCHEMA = z.object({
  id: z.uuidv7(),
  original_url: z.url(),
  short_url: z.string(),
  access_count: z.number(),
  created_at: z.date(),
});
export const URL_PAGE_SCHEMA = z.object({
  items: z.array(URL_SCHEMA),
  next_cursor: z.uuidv7().nullable(),
  total: z.number(),
});
export const ORIGINAL_URL_SCHEMA = z.object({
  original_url: URL_SCHEMA.shape.original_url,
});

export function urlsRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:shortUrl',
    {
      schema: {
        params: z.object({
          shortUrl: z
            .string()
            .regex(SLUG_REGEX, 'Informe uma URL minúscula e sem espaço/caracter especial.'),
        }),
        response: {
          [HttpStatus.HTTP_STATUS_OK]: ORIGINAL_URL_SCHEMA,
          [HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR]: ERROR_SCHEMA,
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params;
      try {
        const items = await db.select().from(urlsTable).where(eq(urlsTable.short_url, shortUrl));
        if (items.length === 0) {
          throw ErrorCodes.URL_NOT_FOUND;
        }
        return { original_url: items.at(0)?.original_url };
      } catch (error) {
        app.log.error(error, `failed retrieving url "${shortUrl}"`);
        return reply
          .status(HttpStatus.HTTP_STATUS_NOT_FOUND)
          .send({ error_code: ErrorCodes.URL_NOT_FOUND });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        querystring: z.object({
          cursor: z.uuidv7().optional(),
          pageSize: z.coerce.number().min(1).default(10),
        }),
        response: {
          [HttpStatus.HTTP_STATUS_OK]: URL_PAGE_SCHEMA,
          [HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR]: ERROR_SCHEMA,
        },
      },
    },
    async (request, reply) => {
      try {
        const { cursor, pageSize } = request.query;
        const query = db
          .select()
          .from(urlsTable)
          .orderBy(desc(urlsTable.id))
          .limit(pageSize + 1);
        if (cursor) {
          query.where(lte(urlsTable.id, cursor));
        }

        const items = await query;

        let nextCursor: string | null = null;
        if (items.length > pageSize) {
          nextCursor = items.pop()?.id || null;
        }

        const total = await db.$count(urlsTable);

        return { items, next_cursor: nextCursor, total };
      } catch (error) {
        app.log.error(error, 'failed retrieving urls');
        return reply
          .status(HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ error_code: ErrorCodes.SERVER_ERROR });
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        body: z.object({
          original_url: z.url('Informe uma url válida.'),
          short_url: z
            .string()
            .min(1, 'URL encurtada não pode estar vazia.')
            .regex(SLUG_REGEX, 'Informe uma URL minúscula e sem espaço/caracter especial.'),
        }),
        response: {
          [HttpStatus.HTTP_STATUS_OK]: URL_SCHEMA,
          [HttpStatus.HTTP_STATUS_UNPROCESSABLE_ENTITY]: z.object({
            error_code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { original_url, short_url } = request.body;

      try {
        await db.insert(urlsTable).values({ original_url, short_url });
        const [url] = await db.select().from(urlsTable).where(eq(urlsTable.short_url, short_url));
        return url;
      } catch (error) {
        app.log.error(error, 'failed saving duplicate url');
        return reply
          .status(HttpStatus.HTTP_STATUS_UNPROCESSABLE_ENTITY)
          .send({ error_code: ErrorCodes.DUPLICATE_URL });
      }
    },
  );
}
