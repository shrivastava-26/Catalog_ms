export type NodeEnv = 'development' | 'test' | 'staging' | 'production';

export interface AppConfig {
  app: {
    name: string;
    env: NodeEnv;
    version: string;
  };
  http: {
    host: string;
    port: number;
    apiPrefix: string;
    trustProxy: boolean;
    jsonBodyLimit: string;
    urlEncodedBodyLimit: string;
    compressionThresholdBytes: number;
    requestTimeoutMs: number;
    headersTimeoutMs: number;
    keepAliveTimeoutMs: number;
    shutdownTimeoutMs: number;
    maxRequestsPerSocket: number;
  };
  cors: {
    origin: string | string[] | boolean;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };
  redis: {
    enabled: boolean;
    url: string;
  };
  queue: {
    enabled: boolean;
  };
  swagger: {
    enabled: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return value;
}

function getBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === 'true';
}

function getList(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

export function loadConfig(): AppConfig {
  const env = (process.env.NODE_ENV ?? 'development') as NodeEnv;

  return {
    app: {
      name: getEnv('APP_NAME', 'catalog-service'),
      env,
      version: getEnv('APP_VERSION', '1.0.0'),
    },
    http: {
      host: getEnv('HOST', '0.0.0.0'),
      port: getNumber('PORT', 3000),
      apiPrefix: getEnv('API_PREFIX', '/api'),
      trustProxy: getBoolean('TRUST_PROXY', true),
      jsonBodyLimit: getEnv('JSON_BODY_LIMIT', '1mb'),
      urlEncodedBodyLimit: getEnv('URL_ENCODED_BODY_LIMIT', '1mb'),
      compressionThresholdBytes: getNumber('COMPRESSION_THRESHOLD_BYTES', 1024),
      requestTimeoutMs: getNumber('REQUEST_TIMEOUT_MS', 15000),
      headersTimeoutMs: getNumber('HEADERS_TIMEOUT_MS', 16000),
      keepAliveTimeoutMs: getNumber('KEEP_ALIVE_TIMEOUT_MS', 5000),
      shutdownTimeoutMs: getNumber('SHUTDOWN_TIMEOUT_MS', 10000),
      maxRequestsPerSocket: getNumber('MAX_REQUESTS_PER_SOCKET', 100),
    },
    cors: {
      origin: process.env.CORS_ORIGIN === '*' ? true : getList('CORS_ORIGIN', ['*']),
      credentials: getBoolean('CORS_CREDENTIALS', true),
      methods: getList('CORS_METHODS', ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']),
      allowedHeaders: getList('CORS_ALLOWED_HEADERS', [
        'Content-Type',
        'Authorization',
        'X-Request-Id',
      ]),
      exposedHeaders: getList('CORS_EXPOSED_HEADERS', ['X-Request-Id']),
      maxAge: getNumber('CORS_MAX_AGE', 86400),
    },
    redis: {
      enabled: getBoolean('REDIS_ENABLED', false),
      url: getEnv('REDIS_URL', 'redis://localhost:6379'),
    },
    queue: {
      enabled: getBoolean('QUEUE_ENABLED', false),
    },
    swagger: {
      enabled: getBoolean('SWAGGER_ENABLED', false),
    },
    logging: {
      level: (process.env.LOG_LEVEL ?? 'info') as AppConfig['logging']['level'],
    },
  };
}