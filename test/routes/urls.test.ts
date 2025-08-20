import assert from 'node:assert/strict';
import { constants as StatusCodes } from 'node:http2';
import { beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';

describe('urls router', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = appBuilder();
  });

  it('should save an URL', async () => {
    const response = await app.inject({ method: 'post', url: '/urls' });
    assert.strictEqual(response.statusCode, StatusCodes.HTTP_STATUS_OK);
    assert.strictEqual(response.body, {
      id: 'a93038da-48fb-4553-84fd-a8f02b1b0aec',
      created_at: '2025-08-20T20:05:57.513Z',
    });
  });
});
