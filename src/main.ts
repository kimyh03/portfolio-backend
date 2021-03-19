import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './shared/sentry/sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
  app.useGlobalInterceptors(new SentryInterceptor());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
