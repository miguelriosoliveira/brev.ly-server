import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';

describe('save URLs', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = appBuilder();
  });

  it('should save an URL', async () => {
    const response = await app.inject({ method: 'post', url: '/urls' });
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, 'hello world');
  });
});
