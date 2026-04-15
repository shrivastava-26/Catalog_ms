import type { Server as HttpServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

import type { BootstrapContext } from './bootstrap.js';

type ShutdownReason =
  | NodeJS.Signals
  | 'UNCAUGHT_EXCEPTION'
  | 'UNHANDLED_REJECTION'
  | 'SERVER_ERROR';

function closeHttpServer(server: HttpServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function createShutdownHandler(ctx: BootstrapContext, server: HttpServer) {
  let shutdownPromise: Promise<number> | null = null;

  return async function shutdown(reason: ShutdownReason, error?: unknown): Promise<number> {
    if (shutdownPromise) {
      ctx.logger.warn({ reason }, 'Shutdown already in progress');
      return shutdownPromise;
    }

    shutdownPromise = (async () => {
      ctx.state.shuttingDown = true;
      ctx.state.ready = false;

      const gracefulTimeoutMs = ctx.config.http.shutdownTimeoutMs;
      const forceCloseConnectionsAfterMs = Math.max(1_000, gracefulTimeoutMs - 1_000);

      ctx.logger.warn(
        {
          reason,
          gracefulTimeoutMs,
          err: error,
        },
        'Graceful shutdown initiated',
      );

      /**
       * Stop keep-alive / new connections.
       * close() stops accepting new connections and waits for existing ones.
       */
      const forceCloseTimer = setTimeout(() => {
        ctx.logger.error(
          { afterMs: forceCloseConnectionsAfterMs },
          'Forcing close of idle/all HTTP connections',
        );

        if (typeof server.closeIdleConnections === 'function') {
          server.closeIdleConnections();
        }

        if (typeof server.closeAllConnections === 'function') {
          server.closeAllConnections();
        }
      }, forceCloseConnectionsAfterMs);

      forceCloseTimer.unref();

      try {
        /**
         * Close the HTTP server within timeout budget
         */
        await Promise.race([
          closeHttpServer(server),
          delay(gracefulTimeoutMs).then(() => {
            throw new Error(`HTTP server close timed out after ${gracefulTimeoutMs}ms`);
          }),
        ]);

        /**
         * Close infra resources
         */
        await Promise.race([
          ctx.close(),
          delay(gracefulTimeoutMs).then(() => {
            throw new Error(`Resource cleanup timed out after ${gracefulTimeoutMs}ms`);
          }),
        ]);

        ctx.logger.info({ reason }, 'Graceful shutdown completed');
        clearTimeout(forceCloseTimer);

        return reason === 'UNCAUGHT_EXCEPTION' || reason === 'SERVER_ERROR' ? 1 : 0;
      } catch (shutdownError) {
        clearTimeout(forceCloseTimer);

        ctx.logger.error(
          {
            reason,
            err: shutdownError,
          },
          'Graceful shutdown failed',
        );

        /**
         * Best-effort hard close
         */
        try {
          if (typeof server.closeAllConnections === 'function') {
            server.closeAllConnections();
          }
        } catch (hardCloseError) {
          ctx.logger.error({ err: hardCloseError }, 'Hard close of HTTP connections failed');
        }

        return 1;
      }
    })();

    return shutdownPromise;
  };
}