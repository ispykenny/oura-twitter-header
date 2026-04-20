import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function run() {
  const logger = new Logger('main');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const dryRun = process.argv.includes('--dry-run');

  try {
    const service = app.get(AppService);
    await service.updateBanner({ dryRun });
    logger.log(dryRun ? 'Dry run complete' : 'Banner updated successfully');
  } catch (err) {
    logger.error('Banner update failed');
    const e = err as Record<string, unknown>;
    const summary = {
      message: e.message,
      code: e.code,
      data: e.data,
      errors: e.errors,
      isAuthError: e.isAuthError,
      headers: e.headers,
    };
    logger.error(JSON.stringify(summary, null, 2));
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

run();
