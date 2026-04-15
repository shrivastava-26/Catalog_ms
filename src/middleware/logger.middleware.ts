import type { NextFunction, Request, Response } from 'express';
import type { Logger } from '../logger/logger.js';

export function loggerMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      logger.info(
        {
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
          ip: req.ip,
        },
        'HTTP request completed',
      );
    });

    next();
  };
}
