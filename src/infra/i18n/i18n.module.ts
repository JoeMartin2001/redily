import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  GraphQLWebsocketResolver,
  HeaderResolver,
  I18nModule as NestI18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { Environment } from '../config/env.validation';

const i18nPath =
  process.env.NODE_ENV === Environment.Production
    ? join(__dirname, 'locales') // dist/infra/i18n/locales
    : join(process.cwd(), 'src/infra/i18n/locales/');

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage'),
        loaderOptions: {
          path: i18nPath,
          watch: [Environment.Development, Environment.Local].includes(
            configService.getOrThrow('app.nodeEnv'),
          ),
        },
        typesOutputPath: join(process.cwd(), 'src/generated/i18n.generated.ts'),
      }),
      resolvers: [
        GraphQLWebsocketResolver,
        { use: QueryResolver, options: ['lang', 'locale'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
  ],
})
export class I18nModule {}
