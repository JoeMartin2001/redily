import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { Environment } from './infra/config/env.validation';
import { I18nMiddleware } from 'nestjs-i18n';
import { I18nGqlExceptionFilter } from './common/filters/i18n-exception.filter';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { AppLogger } from './infra/logger/app-logger.service';

const bootstrap = async () => {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          directives: {
            imgSrc: [
              `'self'`,
              'data:',
              'apollo-server-landing-page.cdn.apollographql.com',
            ],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
            manifestSrc: [
              `'self'`,
              'apollo-server-landing-page.cdn.apollographql.com',
            ],
            frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
          },
        },
      }),
    );

    const appLogger = app.get(AppLogger);
    app.useLogger(appLogger);

    app.use(compression());
    app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 })); // 10MB

    // Global validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // strip unknown properties
        forbidNonWhitelisted: true, // throw error if unknown props
        transform: true, // auto-transform payloads to DTO classes
      }),
    );

    // Global i18n validation
    app.useGlobalFilters(new I18nGqlExceptionFilter());
    app.use(I18nMiddleware);

    // Config service
    const configService = app.get(ConfigService);

    const port =
      Number(process.env.PORT) || // Cloud Run / generic platform
      Number(configService.get('app.port')) || // your own config key
      4000;

    const nodeEnv =
      configService.get<Environment>('app.nodeEnv') ?? Environment.Development;
    const frontendUrl = configService.get<string>('app.frontendUrl') ?? '*';

    // Enable CORS
    app.enableCors({
      origin: [Environment.Development, Environment.Local].includes(nodeEnv)
        ? [
            'http://localhost:5173',
            'http://localhost:3001',
            'http://localhost:3000',
          ]
        : frontendUrl,
      credentials: true,
    });

    await app.listen(port, '0.0.0.0');

    if ([Environment.Development, Environment.Local].includes(nodeEnv)) {
      console.log(`🚀 Application is running on: http://localhost:${port}`);
    } else {
      console.log(`✅ Application started on port ${port} in ${nodeEnv} mode`);
    }
  } catch (error) {
    console.error('❌ Error during application bootstrap:', error);
    throw error;
  }
};

void bootstrap();
