import type { AppConfig } from '../../config/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (meta: unknown, message?: string) => void;
  info: (meta: unknown, message?: string) => void;
  warn: (meta: unknown, message?: string) => void;
  error: (meta: unknown, message?: string) => void;
  fatal?: (meta: unknown, message?: string) => void;
}

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function createLogger(config: AppConfig): Logger {
  const minLevel = config.logging.level;

  const shouldLog = (level: LogLevel): boolean => {
    return levelPriority[level] >= levelPriority[minLevel];
  };

  const write = (level: LogLevel, meta: unknown, message?: string): void => {
    if (!shouldLog(level)) return;

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service: config.app.name,
      env: config.app.env,
      message: message ?? '',
      ...(typeof meta === 'object' && meta !== null ? (meta as Record<string, unknown>) : { meta }),
    };

    const serialized = JSON.stringify(payload);

    if (level === 'error') {
      console.error(serialized);
      return;
    }

    if (level === 'warn') {
      console.warn(serialized);
      return;
    }

    console.log(serialized);
  };

  return {
    debug: (meta, message) => write('debug', meta, message),
    info: (meta, message) => write('info', meta, message),
    warn: (meta, message) => write('warn', meta, message),
    error: (meta, message) => write('error', meta, message),
    fatal: (meta, message) => write('error', meta, message),
  };
}