import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { WinstonModule } from 'nest-winston';
import LokiTransport from 'winston-loki';
import { MetricsMiddleware } from './middlewares/metrics.middleware';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics', // expose endpoint
      defaultMetrics: {
        enabled: true,
      },
    }),
    WinstonModule.forRoot({
      transports: [
        new LokiTransport({
          host: 'http://loki:3100',
          labels: { app: 'ridely-api' },
        }),
      ],
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 1, 2, 5],
    }),
  ],
  exports: [PrometheusModule],
})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
