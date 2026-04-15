// import type { Express } from 'express';

// import { loadConfig } from '../config/index.js';
// import { createLogger } from '../shared/logger/logger.js';
// import { connectDatabase } from '../shared/db/index.js';
// import { connectRedis } from '../shared/cache/redis.js';
// import { createQueueClient } from '../shared/queue/index.js';
// import { initTelemetry } from '../shared/observability/instrumentation.js';
// import { registerSwagger } from '../config/swagger.config.js';

// export interface BootstrapState {
//   startedAt: number;
//   ready: boolean;
//   shuttingDown: boolean;
// }

// export interface BootstrapContext {
//   config: ReturnType<typeof loadConfig>;
//   logger: ReturnType<typeof createLogger>;
//   db: Awaited<ReturnType<typeof connectDatabase>>;
//   redis: Awaited<ReturnType<typeof connectRedis>> | null;
//   queue: Awaited<ReturnType<typeof createQueueClient>> | null;
//   telemetry: Awaited<ReturnType<typeof initTelemetry>> | null;
//   state: BootstrapState;
//   registerDocs: (app: Express) => void;
//   close: () => Promise<void>;
// }

// export async function bootstrap(): Promise<BootstrapContext> {
//   const state: BootstrapState = {
//     startedAt: Date.now(),
//     ready: false,
//     shuttingDown: false,
//   };

//   const config = loadConfig();
//   const logger = createLogger(config);

//   let db: Awaited<ReturnType<typeof connectDatabase>> | null = null;
//   let redis: Awaited<ReturnType<typeof connectRedis>> | null = null;
//   let queue: Awaited<ReturnType<typeof createQueueClient>> | null = null;
//   let telemetry: Awaited<ReturnType<typeof initTelemetry>> | null = null;

//   try {
//     logger.info(
//       {
//         service: config.app.name,
//         env: config.app.env,
//         version: config.app.version,
//       },
//       'Bootstrapping service',
//     );

//     /**
//      * Init observability first if possible, so startup issues can be traced/logged properly.
//      */
//     telemetry = await initTelemetry(config, logger);

//     /**
//      * Infra connections
//      * You can parallelize where safe.
//      */
//     const [dbConn, redisConn, queueClient] = await Promise.all([
//       connectDatabase(config, logger),
//       config.redis.enabled ? connectRedis(config, logger) : Promise.resolve(null),
//       config.queue.enabled ? createQueueClient(config, logger) : Promise.resolve(null),
//     ]);

//     db = dbConn;
//     redis = redisConn;
//     queue = queueClient;

//     /**
//      * Start consumers only after queue client is ready.
//      * If your queue abstraction exposes startConsumers(), call it here.
//      */
//     if (queue && typeof queue.startConsumers === 'function') {
//       await queue.startConsumers();
//     }

//     const ctx: BootstrapContext = {
//       config,
//       logger,
//       db,
//       redis,
//       queue,
//       telemetry,
//       state,
//       registerDocs(app: Express) {
//         if (!config.swagger.enabled) return;
//         registerSwagger(app, config);
//       },
//       async close() {
//         const closeTasks: Promise<unknown>[] = [];

//         /**
//          * Stop queue consumers first so no new background work starts
//          */
//         if (queue && typeof queue.stopConsumers === 'function') {
//           closeTasks.push(queue.stopConsumers());
//         }

//         /**
//          * Close infra connections
//          */
//         if (redis && typeof redis.quit === 'function') {
//           closeTasks.push(redis.quit());
//         } else if (redis && typeof redis.disconnect === 'function') {
//           closeTasks.push(Promise.resolve(redis.disconnect()));
//         }

//         if (db && typeof db.close === 'function') {
//           closeTasks.push(db.close());
//         } else if (db && typeof db.disconnect === 'function') {
//           closeTasks.push(db.disconnect());
//         }

//         if (telemetry && typeof telemetry.shutdown === 'function') {
//           closeTasks.push(telemetry.shutdown());
//         }

//         const results = await Promise.allSettled(closeTasks);

//         for (const result of results) {
//           if (result.status === 'rejected') {
//             logger.error({ err: result.reason }, 'Error while closing bootstrap resources');
//           }
//         }
//       },
//     };

//     state.ready = true;

//     logger.info(
//       {
//         db: true,
//         redis: !!redis,
//         queue: !!queue,
//         telemetry: !!telemetry,
//       },
//       'Bootstrap completed successfully',
//     );

//     return ctx;
//   } catch (error) {
//     logger.error({ err: error }, 'Bootstrap failed');

//     /**
//      * Best-effort cleanup on partial startup failure
//      */
//     const cleanupTasks: Promise<unknown>[] = [];

//     if (queue && typeof queue.stopConsumers === 'function') {
//       cleanupTasks.push(queue.stopConsumers());
//     }

//     if (redis && typeof redis.quit === 'function') {
//       cleanupTasks.push(redis.quit());
//     } else if (redis && typeof redis.disconnect === 'function') {
//       cleanupTasks.push(Promise.resolve(redis.disconnect()));
//     }

//     if (db && typeof db.close === 'function') {
//       cleanupTasks.push(db.close());
//     } else if (db && typeof db.disconnect === 'function') {
//       cleanupTasks.push(db.disconnect());
//     }

//     if (telemetry && typeof telemetry.shutdown === 'function') {
//       cleanupTasks.push(telemetry.shutdown());
//     }

//     await Promise.allSettled(cleanupTasks);

//     throw error;
//   }
// }
// ``