// src/infra/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppLogger } from './app-logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  providers: [
    AppLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [AppLogger],
})
export class LoggerModule {}
