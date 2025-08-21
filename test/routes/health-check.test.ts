import { constants as StatusCodes } from 'node:http2';
import type { FastifyInstance } from 'fastify';
import { appBuilder } from '../../src/app.ts';

describe('health check router', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = appBuilder();
  });

  it('should request health check', async () => {
    const response = await app.inject({ method: 'get', url: '/health' });
    expect(response.statusCode).toBe(StatusCodes.HTTP_STATUS_OK);
    expect(response.body).toBe("I'm healthy");
  });
});
