import type { NextFunction, Request, Response } from 'express';
import type { BootstrapContext } from '../../app/bootstrap.js';

export function requestContextMiddleware(_ctx: BootstrapContext) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.context = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      startedAt: Date.now(),
      user: req.user,
    };

    next();
  };
}
