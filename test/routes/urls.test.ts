import { reset } from 'drizzle-seed';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';
import { db } from '../../src/db/index.ts';
import dbSchema from '../../src/db/schema.ts';

const UUID_V1_TO_V5_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('urls router', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await reset(db, dbSchema);
    app = appBuilder();
  });

  it('should save an URL', async () => {
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
});
