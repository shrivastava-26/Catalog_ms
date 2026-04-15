// import express, { type Express, type Request, type Response } from 'express';
// import helmet from 'helmet';
// import cors from 'cors';
// import compression from 'compression';

// import routes from '../routes/index.js';
// import type { BootstrapContext } from './bootstrap.js';

// import { requestIdMiddleware } from '../shared/middleware/request-id.middleware.js';
// import { requestContextMiddleware } from '../shared/middleware/request-context.middleware.js';
// import { loggerMiddleware } from '../shared/middleware/logger.middleware.js';
// import { notFoundMiddleware } from '../shared/middleware/not-found.middleware.js';
// import { errorMiddleware } from '../shared/middleware/error.middleware.js';

// export function createApp(ctx: BootstrapContext): Express {
//   const app = express();

//   /**
//    * Basic app hardening
//    */
//   app.disable('x-powered-by');
//   app.set('trust proxy', ctx.config.http.trustProxy);

//   /**
//    * Health endpoints should be available even during degraded state.
//    * Keep them lightweight and independent.
//    */
//   app.get('/livez', (_req: Request, res: Response) => {
//     return res.status(200).json({
//       success: true,
//       data: {
//         service: ctx.config.app.name,
//         status: 'alive',
//         uptimeSeconds: Math.floor((Date.now() - ctx.state.startedAt) / 1000),
//       },
//     });
//   });

//   app.get('/readyz', (_req: Request, res: Response) => {
//     const ready = ctx.state.ready && !ctx.state.shuttingDown;

//     return res.status(ready ? 200 : 503).json({
//       success: ready,
//       data: {
//         service: ctx.config.app.name,
//         status: ready ? 'ready' : 'not_ready',
//         shuttingDown: ctx.state.shuttingDown,
//       },
//     });
//   });

//   /**
//    * Security headers
//    */
//   app.use(
//     helmet({
//       crossOriginResourcePolicy: { policy: 'cross-origin' },
//       contentSecurityPolicy: ctx.config.app.env === 'production' ? undefined : false,
//     }),
//   );

//   /**
//    * CORS
//    */
//   app.use(
//     cors({
//       origin: ctx.config.cors.origin,
//       credentials: ctx.config.cors.credentials,
//       methods: ctx.config.cors.methods,
//       allowedHeaders: ctx.config.cors.allowedHeaders,
//       exposedHeaders: ctx.config.cors.exposedHeaders,
//       maxAge: ctx.config.cors.maxAge,
//     }),
//   );

//   /**
//    * Compression
//    * Avoid compressing tiny responses unnecessarily.
//    */
//   app.use(
//     compression({
//       threshold: ctx.config.http.compressionThresholdBytes,
//     }),
//   );

//   /**
//    * Body parsers
//    * strict: true => only objects/arrays for JSON
//    * limit => protects from oversized payloads
//    */
//   app.use(
//     express.json({
//       limit: ctx.config.http.jsonBodyLimit,
//       strict: true,
//       type: ['application/json', 'application/*+json'],
//     }),
//   );

//   app.use(
//     express.urlencoded({
//       extended: false,
//       limit: ctx.config.http.urlEncodedBodyLimit,
//     }),
//   );

//   /**
//    * Request-scoped metadata
//    * requestId should come as early as possible
//    */
//   app.use(requestIdMiddleware);
//   app.use(requestContextMiddleware(ctx));
//   app.use(loggerMiddleware(ctx.logger));

//   /**
//    * Attach docs if enabled
//    * This is kept in bootstrap context so app remains thin.
//    */
//   ctx.registerDocs(app);

//   /**
//    * Main API routes
//    */
//   app.use(ctx.config.http.apiPrefix, routes);

//   /**
//    * 404 for unmatched routes
//    */
//   app.use(notFoundMiddleware);

//   /**
//    * Centralized error handler must be last
//    */
//   app.use(errorMiddleware(ctx.logger, ctx.config));

//   return app;
// }
