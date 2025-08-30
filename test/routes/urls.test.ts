import { constants as HttpStatus } from 'node:http2';
import { reset } from 'drizzle-seed';
import type { FastifyInstance } from 'fastify';
import type z from 'zod';
import { appBuilder } from '../../src/app.ts';
import { db } from '../../src/db/index.ts';
import dbSchema, { urlsTable } from '../../src/db/schema.ts';
import { seed } from '../../src/db/seed.ts';
import { ErrorCodes } from '../../src/errors/error-codes.ts';
import type { URL_PAGE_SCHEMA } from '../../src/routes/urls.ts';

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
    const response = await app.inject().post('/urls').body({
      original_url: 'http://example.com',
      short_url: 'ex',
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

    const response = await app.inject().post('/urls').body({ original_url, short_url });

    expect(response.statusCode).toBe(HttpStatus.HTTP_STATUS_UNPROCESSABLE_ENTITY);
    const body = response.json();
    expect(body).toEqual({ error_code: ErrorCodes.DUPLICATE_URL });
  });

  it('should retrieve 10-items page 1 of urls with default querystring', async () => {
    const total = 15;
    const page = 1;
    const pageSize = 10;
    await seed(total);
    const page1 = await db
      .select()
      .from(urlsTable)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    const response = await app.inject().get('/urls');

    const body = response.json<z.infer<typeof URL_PAGE_SCHEMA>>();
    const items = page1.map(url => ({
      ...url,
      created_at: url.created_at.toISOString(),
    }));
    expect(body.items).toHaveLength(pageSize);
    expect(body).toEqual({ items, page, total });
  });

  it('should retrieve 10-items page 1 of urls setting querystring', async () => {
    const total = 15;
    const page = 1;
    const pageSize = 10;
    await seed(total);
    const urlsPage = await db
      .select()
      .from(urlsTable)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    const response = await app.inject().get('/urls').query({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const body = response.json<z.infer<typeof URL_PAGE_SCHEMA>>();
    const items = urlsPage.map(url => ({
      ...url,
      created_at: url.created_at.toISOString(),
    }));
    expect(body.items).toHaveLength(pageSize);
    expect(body).toEqual({ items, page, total });
  });

  it('should retrieve 5-items page 2 of urls', async () => {
    const total = 15;
    const page = 2;
    const pageSize = 10;
    await seed(total);
    const urlsPage = await db
      .select()
      .from(urlsTable)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    const response = await app.inject().get('/urls').query({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const body = response.json<z.infer<typeof URL_PAGE_SCHEMA>>();
    const items = urlsPage.map(url => ({
      ...url,
      created_at: url.created_at.toISOString(),
    }));
    expect(body.items).toHaveLength(total % pageSize);
    expect(body).toEqual({ items, page, total });
  });

  it('should retrieve empty page 3 of urls', async () => {
    const total = 15;
    const page = 3;
    const pageSize = 10;
    await seed(total);

    const response = await app.inject().get('/urls').query({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const body = response.json<z.infer<typeof URL_PAGE_SCHEMA>>();
    expect(body).toEqual({ items: [], page, total });
  });
});
