import { Injectable, Logger } from '@nestjs/common';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { OuraService } from './oura/oura.service';
import { BannerService } from './banner/banner.service';
import { TwitterService } from './twitter/twitter.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly oura: OuraService,
    private readonly banner: BannerService,
    private readonly twitter: TwitterService,
  ) {}

  async updateBanner(opts: { dryRun?: boolean } = {}): Promise<void> {
    const summary = await this.oura.getDailySummary();
    this.logger.log(
      `Sleep ${summary.sleep.latest.score} · Activity ${summary.activity.latest.score} for ${summary.sleep.latest.day}`,
    );

    const png = await this.banner.render(summary);
    this.logger.log(`Rendered banner: ${png.byteLength} bytes`);

    if (opts.dryRun) {
      const outPath = resolve(process.cwd(), 'banner-preview.png');
      await writeFile(outPath, png);
      this.logger.log(`Dry run — wrote preview to ${outPath} (skipped Twitter upload)`);
      return;
    }

    await this.twitter.updateBanner(png);
  }
}
