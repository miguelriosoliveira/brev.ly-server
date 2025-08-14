import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../src/app.ts';

describe('health check', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = appBuilder();
  });

  it('should request health check', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });
    assert.strictEqual(response.statusCode, 200);
  });
});
