import assert from 'node:assert/strict';
import { constants as StatusCodes } from 'node:http2';
import { beforeEach, describe, it } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';

describe('health check router', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = appBuilder();
  });

  it('should request health check', async () => {
    const response = await app.inject({ method: 'get', url: '/health' });
    assert.strictEqual(response.statusCode, StatusCodes.HTTP_STATUS_OK);
    assert.strictEqual(response.body, "I'm healthy");
  });
});
