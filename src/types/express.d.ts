declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      context?: {
        requestId?: string;
        method: string;
        url: string;
        startedAt: number;
        user?: {
          id: string;
          roles: string[];
        };
      };
      user?: {
        id: string;
        roles: string[];
      };
    }
  }
}

export {};