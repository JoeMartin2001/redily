// src/infra/logger/logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../app-logger.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType<'http' | 'rpc' | 'ws' | 'graphql'>();

    if (type === 'http') {
      return this.handleHttp(context, next);
    }

    if (type === 'graphql') {
      return this.handleGraphql(context, next);
    }

    // fallback (ws/rpc/etc.)
    return next.handle();
  }

  private handleHttp(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const now = Date.now();

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<
      Request & { requestId?: string; user?: any }
    >();
    const res = httpCtx.getResponse<any>();

    const method = req.method;
    const url = (req as any).originalUrl || (req as any).url;
    const requestId = (req as any).requestId;
    const userId = (req as any).user?.id ?? null;

    this.logger.log({
      msg: 'Incoming HTTP request',
      kind: 'http',
      method,
      url,
      requestId,
      userId,
    });

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - now;
        const statusCode = res.statusCode;

        this.logger.log({
          msg: 'HTTP request completed',
          kind: 'http',
          method,
          url,
          statusCode,
          durationMs,
          requestId,
          userId,
        });
      }),
    );
  }

  private handleGraphql(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const now = Date.now();

    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo<GraphQLResolveInfo>();
    const ctx = gqlCtx.getContext<{
      req: Request & { requestId?: string; user?: any };
      res?: any;
    }>();

    const { req, res } = ctx;

    // Only log for root fields (to avoid spam on nested resolvers)
    // path.prev is null for root
    if (info.path.prev) {
      return next.handle();
    }

    const requestId = (req as any)?.requestId;
    const userId = (req as any)?.user?.id ?? null;

    const operationName = info.operation.name?.value ?? null;
    const operationType = info.operation.operation; // 'query' | 'mutation' | 'subscription'
    const fieldName = info.fieldName;

    // You can choose how much of variables to log (careful with sensitive data)
    const variables = (gqlCtx.getArgs && gqlCtx.getArgs()) || undefined;

    this.logger.log({
      msg: 'Incoming GraphQL request',
      kind: 'graphql',
      operationName,
      operationType,
      fieldName,
      requestId,
      userId,
      variables,
    });

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - now;
        const statusCode = (res as any)?.statusCode ?? 200; // usually 200 for GraphQL

        this.logger.log({
          msg: 'GraphQL request completed',
          kind: 'graphql',
          operationName,
          operationType,
          fieldName,
          statusCode,
          durationMs,
          requestId,
          userId,
        });
      }),
    );
  }
}
