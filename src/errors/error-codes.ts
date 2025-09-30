import z from 'zod';

export const ErrorCodes = {
  URL_NOT_FOUND: 'URL_NOT_FOUND',
  DUPLICATE_URL: 'DUPLICATE_URL',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_SCHEMA = z.object({
  error_code: z.enum(Object.values(ErrorCodes)),
});
