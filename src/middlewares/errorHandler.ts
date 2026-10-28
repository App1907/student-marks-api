import type { ErrorRequestHandler } from 'express';
import { ZodError, z } from 'zod';
import { isProduction } from '../config/env';
import { isAppError } from '../errors/AppError';
import { sendError } from '../utils/response';

/**
 * The single place errors become HTTP responses, always in the standard
 * error shape: { success: false, message, details }.
 *
 * Express identifies it as an error handler because it takes FOUR arguments.
 * Express 5 forwards rejected promises from async handlers here automatically,
 * so controllers don't need try/catch.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (isAppError(err)) {
    sendError(res, err.statusCode, err.message, err.details ?? null);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, 'Validation failed', z.flattenError(err).fieldErrors);
    return;
  }

  // Malformed JSON body from express.json()
  if (err?.type === 'entity.parse.failed') {
    sendError(res, 400, 'Malformed JSON body', err.message);
    return;
  }

  console.error('Unhandled error:', err);
  sendError(
    res,
    500,
    'Internal Server Error',
    isProduction ? null : { name: (err as Error).name, message: (err as Error).message },
  );
};
