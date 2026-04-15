import { express } from 'express';
// import http from 'node:http';
// import process from 'node:process';

// import { bootstrap } from './bootstrap.js';
// import { createApp } from './app.js';
// import { createShutdownHandler } from './shutdown.js';

// async function main(): Promise<void> {
//   const ctx = await bootstrap();
//   const app = createApp(ctx);

//   const server = http.createServer(app);

//   /**
//    * Server-level hardening and tuning
//    */
//   server.requestTimeout = ctx.config.http.requestTimeoutMs;
//   server.headersTimeout = ctx.config.http.headersTimeoutMs;
//   server.keepAliveTimeout = ctx.config.http.keepAliveTimeoutMs;
//   server.maxRequestsPerSocket = ctx.config.http.maxRequestsPerSocket;

//   const shutdown = createShutdownHandler(ctx, server);

//   server.on('error', async (error) => {
//     ctx.logger.error({ err: error }, 'HTTP server error');
//     const code = await shutdown('SERVER_ERROR', error);
//     process.exit(code);
//   });

//   /**
//    * Start listening
//    */
//   await new Promise<void>((resolve, reject) => {
//     server.listen(ctx.config.http.port, ctx.config.http.host, () => {
//       ctx.logger.info(
//         {
//           service: ctx.config.app.name,
//           env: ctx.config.app.env,
//           host: ctx.config.http.host,
//           port: ctx.config.http.port,
//           apiPrefix: ctx.config.http.apiPrefix,
//         },
//         'HTTP server started',
//       );
//       resolve();
//     });

//     server.once('error', reject);
//   });

//   /**
//    * OS signals
//    */
//   process.once('SIGTERM', async () => {
//     ctx.logger.warn('Received SIGTERM');
//     const code = await shutdown('SIGTERM');
//     process.exit(code);
//   });

//   process.once('SIGINT', async () => {
//     ctx.logger.warn('Received SIGINT');
//     const code = await shutdown('SIGINT');
//     process.exit(code);
//   });

//   /**
//    * Process-level failures
//    * In production, safest default is to log and shut down gracefully.
//    */
//   process.once('unhandledRejection', async (reason) => {
//     ctx.logger.error({ err: reason }, 'Unhandled promise rejection');
//     const code = await shutdown('UNHANDLED_REJECTION', reason);
//     process.exit(code);
//   });

//   process.once('uncaughtException', async (error) => {
//     ctx.logger.fatal?.({ err: error }, 'Uncaught exception');
//     if (!ctx.logger.fatal) {
//       ctx.logger.error({ err: error }, 'Uncaught exception');
//     }

//     const code = await shutdown('UNCAUGHT_EXCEPTION', error);
//     process.exit(code);
//   });

//   process.on('warning', (warning) => {
//     ctx.logger.warn({ warning }, 'Process warning emitted');
//   });
// }

// main().catch((error) => {
//   // No logger may exist yet if bootstrap fails very early
//   console.error('Fatal startup error:', error);
//   process.exit(1);
// });


import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from EC2");
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});