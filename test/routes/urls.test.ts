import { constants as HttpStatus } from 'node:http2';
import { desc, eq, lte } from 'drizzle-orm';
import { reset } from 'drizzle-seed';
import type { FastifyInstance } from 'fastify';
import type z from 'zod';
import { appBuilder } from '../../src/app.ts';
import { db } from '../../src/db/index.ts';
import dbSchema, { urlsTable } from '../../src/db/schema.ts';
import { seed } from '../../src/db/seed.ts';
import { ErrorCodes } from '../../src/errors/error-codes.ts';
import type { URL_PAGE_SCHEMA } from '../../src/routes/urls.ts';

const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const responseBody = response.json();
    expect(responseBody.id).toMatch(UUID_V7_REGEX);
    const createdAt = new Date(responseBody.created_at).getTime();
    expect(createdAt).toBeGreaterThan(timeBefore);
    expect(createdAt).toBeLessThan(timeAfter);
  });

  it('should fail when saving duplicate url', async () => {
    const originalUrl = 'http://example.com';
    const shortUrl = 'ex';
    await db.insert(urlsTable).values({ original_url: originalUrl, short_url: shortUrl });

    const response = await app
      .inject()
      .post('/urls')
      .body({ original_url: originalUrl, short_url: shortUrl });

    expect(response.statusCode).toBe(HttpStatus.HTTP_STATUS_UNPROCESSABLE_ENTITY);
    const body = response.json();
    expect(body).toEqual({ error_code: ErrorCodes.DUPLICATE_URL });
  });

  it('should retrieve 10-items page 1 of urls with default querystring', async () => {
    const total = 15;
    const pageSize = 10;
    await seed(total);
    const urlsPage = await db
      .select()
      .from(urlsTable)
      .orderBy(desc(urlsTable.id))
      .limit(pageSize + 1);
    const last = urlsPage.pop();

    const response = await app.inject().get('/urls');

    const items = urlsPage.map(url => ({
      ...url,
      created_at: url.created_at.toISOString(),
    }));
    expect(response.json()).toEqual({ items, next_cursor: last?.id, total });
  });

  it('should retrieve 10-items page 1 of urls setting querystring', async () => {
    const total = 15;
    const pageSize = 10;
    await seed(total);
    const urlsPage = await db
      .select()
      .from(urlsTable)
      .orderBy(desc(urlsTable.id))
      .limit(pageSize + 1);
    const last = urlsPage.pop();

    const response = await app.inject().get('/urls').query({
      pageSize: pageSize.toString(),
    });

    const responseBody = response.json<z.infer<typeof URL_PAGE_SCHEMA>>();
    const items = urlsPage.map(url => ({
      ...url,
      created_at: url.created_at.toISOString(),
    }));
    expect(responseBody.items).toHaveLength(pageSize);
    expect(responseBody).toEqual({ items, next_cursor: last?.id, total });
  });

  it('should retrieve 5-items page 2 of urls', async () => {
    const total = 15;
    const pageSize = 10;
    await seed(total);
    const page1 = await db
      .select()
      .from(urlsTable)
      .orderBy(desc(urlsTable.id))
      .limit(pageSize + 1);
    const cursor = page1.pop()?.id as string;
    const page2 = await db
      .select()
      .from(urlsTable)
      .where(lte(urlsTable.id, cursor))
      .orderBy(desc(urlsTable.id))
      .limit(pageSize + 1);

    const response = await app.inject().get('/urls').query({
      cursor,
      pageSize: pageSize.toString(),
    });

    const responseBody = response.json<z.infer<typeof URL_PAGE_SCHEMA>>();
    const items = page2.map(url => ({
      ...url,
      created_at: url.created_at.toISOString(),
    }));
    expect(responseBody.items).toHaveLength(total % pageSize);
    expect(responseBody).toEqual({ items, next_cursor: null, total });
  });

  it('should retrieve original url from short url', async () => {
    const originalUrl = 'http://example.com';
    const shortUrl = 'ex';
    await db.insert(urlsTable).values({ original_url: originalUrl, short_url: shortUrl });

    const response = await app.inject().get(`/urls/${shortUrl}`);

    expect(response.json()).toEqual({ original_url: originalUrl, access_count: 1 });
  });

  it('should delete original url from short url', async () => {
    const originalUrl = 'http://example.com';
    const shortUrl = 'ex';
    const [url] = await db
      .insert(urlsTable)
      .values({ original_url: originalUrl, short_url: shortUrl })
      .returning({ id: urlsTable.id });

    const response = await app.inject().delete(`/urls/${shortUrl}`);

    expect(response.json()).toEqual(url);
    const deletedUrls = await db.select().from(urlsTable).where(eq(urlsTable.id, url.id));
    expect(deletedUrls).toEqual([]);
  });

  it('should increase access count on successful url retrieval', async () => {
    const originalUrl = 'http://example.com';
    const shortUrl = 'ex';
    await db.insert(urlsTable).values({ original_url: originalUrl, short_url: shortUrl });

    await app.inject().get(`/urls/${shortUrl}`);
    await app.inject().get(`/urls/${shortUrl}`);
    const response = await app.inject().get(`/urls/${shortUrl}`);

    expect(response.json()).toEqual({ original_url: originalUrl, access_count: 3 });
  });

  it('should not increase access count on failed url retrieval', async () => {
    const originalUrl = 'http://example.com';
    const shortUrl = 'ex';
    await db.insert(urlsTable).values({ original_url: originalUrl, short_url: shortUrl });
    const spy = vi.spyOn(db, 'update').mockImplementation(() => {
      throw new Error('boom');
    });

    const response = await app.inject().get(`/urls/${shortUrl}`);

    expect(response.statusCode).toBe(HttpStatus.HTTP_STATUS_NOT_FOUND);
    const [url] = await db.select().from(urlsTable).where(eq(urlsTable.short_url, shortUrl));
    expect(url.access_count).toBe(0);
    spy.mockRestore();
  });
});
