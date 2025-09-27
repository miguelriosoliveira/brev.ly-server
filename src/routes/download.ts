import { constants as HttpStatus } from 'node:http2';
import { desc } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../db/index.ts';
import { urlsTable } from '../db/schema.ts';
import { ERROR_SCHEMA, ErrorCodes } from '../errors/error-codes.ts';

const CSV_SCHEMA = z
  .string()
  .describe(
    'CSV string with columns: id,original_url,short_url,access_count,created_at. Each row is separated by a newline.',
  );

export function downloadsRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        response: {
          [HttpStatus.HTTP_STATUS_OK]: CSV_SCHEMA,
          [HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR]: ERROR_SCHEMA,
        },
      },
    },
    async (_request, reply) => {
      try {
        const urls = await db.select().from(urlsTable).orderBy(desc(urlsTable.id));

        const csv = ['ID,Original URL,Short URL,Access Count,Created At'];
        for (const url of urls) {
          const createdAt = new Date(url.created_at)
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '');
          csv.push(
            [url.id, url.original_url, url.short_url, url.access_count, createdAt].join(','),
          );
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        const filename = `${crypto.randomUUID()}${timestamp}linkscsv.csv`;
        return reply
          .header('Content-Type', 'text/csv')
          .header('Content-Disposition', `attachment; filename="${filename}"`)
          .send(csv.join('\n'));
      } catch (error) {
        app.log.error(error, 'failed retrieving urls');
        return reply
          .status(HttpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ error_code: ErrorCodes.SERVER_ERROR });
      }
    },
  );
}
