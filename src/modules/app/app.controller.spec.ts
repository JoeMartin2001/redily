import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

describe('AppController', () => {
  let appController: AppController;
  let i18n: I18nContext<I18nTranslations>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    i18n = app.get<I18nContext<I18nTranslations>>(I18nContext);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello(i18n)).toBe('Hello World!');
    });
  });
});
