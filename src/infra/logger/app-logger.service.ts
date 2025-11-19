// src/infra/logger/app-logger.service.ts
import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

type Level = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

@Injectable()
export class AppLogger implements LoggerService {
  private levels: Level[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  setLogLevels(levels: LogLevel[]) {
    this.levels = levels as Level[];
  }

  private write(level: Level, message: any, context?: string) {
    if (!this.levels.includes(level)) return;

    const payload = {
      level,
      msg: typeof message === 'object' ? (message.msg ?? message) : message,
      data: typeof message === 'object' ? message : undefined,
      context,
      timestamp: new Date().toISOString(),
    };

    // Loki-friendly: pure JSON, single line
    process.stdout.write(JSON.stringify(payload) + '\n');
  }

  log(message: any, context?: string) {
    this.write('log', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    const data =
      typeof message === 'object' ? { ...message, trace } : { message, trace };

    this.write('error', data, context);
  }

  warn(message: any, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.write('verbose', message, context);
  }
}
