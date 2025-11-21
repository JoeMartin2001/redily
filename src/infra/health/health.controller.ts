import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Environment } from '../config/env.validation';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check API health
      () => {
        const port = this.configService.get<number>('app.port') ?? 4000;
        return this.http.pingCheck('ridely-api', `http://localhost:${port}`);
      },

      // Check database health
      () => this.db.pingCheck('database'),

      // Check disk health
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),

      // Check memory heap usage
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
