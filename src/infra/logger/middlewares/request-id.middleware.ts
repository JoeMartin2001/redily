// src/infra/logger/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { REQUEST_ID_HEADER } from '../logger.constants';

declare module 'http' {
  interface IncomingMessage {
    requestId?: string;
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    let requestId = req.headers[REQUEST_ID_HEADER] as string | undefined;

    if (!requestId) {
      requestId = randomUUID();
      res.setHeader(REQUEST_ID_HEADER, requestId);
    }

    req.requestId = requestId;
    next();
  }
}
