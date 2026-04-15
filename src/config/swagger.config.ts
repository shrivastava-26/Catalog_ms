import type { Express, Request, Response } from 'express';
import type { AppConfig } from './index.js';

export function registerSwagger(app: Express, config: AppConfig): void {
  if (!config.swagger.enabled) return;

  app.get('/docs', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Swagger not configured yet. Add swagger-ui-express + OpenAPI later.',
      },
    });
  });
}
