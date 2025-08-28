import { constants as HttpStatus } from 'node:http2';
import { reset } from 'drizzle-seed';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';
import { db } from '../../src/db/index.ts';
import dbSchema, { urlsTable } from '../../src/db/schema.ts';
import { ErrorCodes } from '../../src/errors/error-codes.ts';

const UUID_V1_TO_V5_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('urls router', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await reset(db, dbSchema);
    app = appBuilder();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should save an url', async () => {
    const timeBefore = Date.now();
    const response = await app.inject({
      method: 'post',
      url: '/urls',
      body: {
        original_url: 'http://example.com',
        short_url: 'ex',
      },
    });
    const timeAfter = Date.now();

    const body = response.json();
    expect(body.id).toMatch(UUID_V1_TO_V5_REGEX);
    const createdAt = new Date(body.created_at).getTime();
    expect(createdAt).toBeGreaterThan(timeBefore);
    expect(createdAt).toBeLessThan(timeAfter);
  });

  it('should fail when saving duplicate url', async () => {
    const original_url = 'http://example.com';
    const short_url = 'ex';
    await db.insert(urlsTable).values({ original_url, short_url });

    const response = await app.inject({
      method: 'post',
      url: '/urls',
      body: { original_url, short_url },
    });

    expect(response.statusCode).toBe(HttpStatus.HTTP_STATUS_UNPROCESSABLE_ENTITY);
    const body = response.json();
    expect(body).toEqual({ error_code: ErrorCodes.DUPLICATE_URL });
  });
});
