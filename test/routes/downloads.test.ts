import { reset } from 'drizzle-seed';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';
import { db } from '../../src/db/index.ts';
import dbSchema from '../../src/db/schema.ts';

const contentDispositionRegex = /^attachment; filename=".+\.csv"$/;

describe('urls router', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await reset(db, dbSchema);
    app = appBuilder();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should download all urls in csv format', async () => {
    const today = new Date('1965-04-16');
    const yesterday = new Date('1965-04-15');
    const twoDaysAgo = new Date('1965-04-14');
    await db.insert(dbSchema.urlsTable).values([
      {
        id: '00de57d3-cc00-7632-ba8e-f10884c1589f',
        original_url: 'https://github.com/miguelriosoliveira',
        short_url: 'my-github',
        access_count: 123,
        created_at: twoDaysAgo,
      },
      {
        id: '00de5cfa-2800-7fb3-b1f9-db01293943a5',
        original_url: 'https://linkedin.com/in/miguelriosoliveira',
        short_url: 'my-linkedin',
        access_count: 456,
        created_at: yesterday,
      },
      {
        id: '00de6220-8400-767a-92e6-34fc196a0dde',
        original_url: 'https://miguelrios.dev',
        short_url: 'my-site',
        access_count: 789,
        created_at: today,
      },
    ]);

    const response = await app.inject().get('/downloads');

    expect(response.headers).toEqual(
      expect.objectContaining({
        'content-type': 'text/csv',
        'content-disposition': expect.stringMatching(contentDispositionRegex),
      }),
    );
    const expectedBody = [
      'ID,Original URL,Short URL,Access Count,Created At',
      [
        '00de6220-8400-767a-92e6-34fc196a0dde',
        'https://miguelrios.dev',
        'my-site',
        '789',
        '1965-04-16 00:00:00.000',
      ].join(','),
      [
        '00de5cfa-2800-7fb3-b1f9-db01293943a5',
        'https://linkedin.com/in/miguelriosoliveira',
        'my-linkedin',
        '456',
        '1965-04-15 00:00:00.000',
      ].join(','),
      [
        '00de57d3-cc00-7632-ba8e-f10884c1589f',
        'https://github.com/miguelriosoliveira',
        'my-github',
        '123',
        '1965-04-14 00:00:00.000',
      ].join(','),
    ];
    expect(response.body).toBe(expectedBody.join('\n'));
  });
});
