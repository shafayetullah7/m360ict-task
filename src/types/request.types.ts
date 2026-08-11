import type { Request, RequestHandler, Response } from 'express';

/** Route param after Joi coerces `:id` to a number. */
export type IdParam = { id: number };

/**
 * Adapts a typed Express Request handler for use with Router.
 *
 * Express Router defaults to ParamsDictionary / ParsedQs, so a handler typed as
 * Request<{ id: number }, ..., CreateBody, ListQuery> is not assignable without
 * a single cast at the boundary. Controllers stay fully typed; the cast lives here.
 */
export function toHandler<
  TParams = Record<string, never>,
  TBody = unknown,
  TQuery = Record<string, never>,
>(
  handler: (
    req: Request<TParams, unknown, TBody, TQuery>,
    res: Response,
  ) => void | Promise<void>,
): RequestHandler {
  return handler as unknown as RequestHandler;
}
