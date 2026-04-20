import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import satori from 'satori';
import sharp from 'sharp';
import type { SleepSummary } from '../oura/oura.service';
import { BANNER_DIMS, buildBanner } from './template';

const INTER_REGULAR_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff';
const INTER_BOLD_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff';

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);
  private fontCache: { regular: Buffer; bold: Buffer } | null = null;

  async render(summary: SleepSummary): Promise<Buffer> {
    const fonts = await this.loadFonts();
    const tree = buildBanner(summary);

    const svg = await satori(tree as never, {
      width: BANNER_DIMS.width,
      height: BANNER_DIMS.height,
      fonts: [
        { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    });

    return sharp(Buffer.from(svg)).png().toBuffer();
  }

  private async loadFonts(): Promise<{ regular: Buffer; bold: Buffer }> {
    if (this.fontCache) return this.fontCache;
    const [regular, bold] = await Promise.all([
      fetchBuffer(INTER_REGULAR_URL),
      fetchBuffer(INTER_BOLD_URL),
    ]);
    this.fontCache = { regular, bold };
    return this.fontCache;
  }
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const { data } = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: 15_000,
  });
  return Buffer.from(data);
}
