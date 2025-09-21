import z from 'zod';

export const ErrorCodes = {
  DUPLICATE_URL: 'DUPLICATE_URL',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_SCHEMA = z.object({
  error_code: z.enum(Object.values(ErrorCodes)),
});
