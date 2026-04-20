import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private readonly client: TwitterApi;

  constructor(config: ConfigService) {
    const appKey = requireConfig(config, 'TWITTER_CONSUMER_KEY');
    const appSecret = requireConfig(config, 'TWITTER_CONSUMER_SECRET');
    const accessToken = requireConfig(config, 'TWITTER_ACCESS_TOKEN');
    const accessSecret = requireConfig(config, 'TWITTER_ACCESS_TOKEN_SECRET');

    this.client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
  }

  async updateBanner(png: Buffer): Promise<void> {
    await this.client.v1.updateAccountProfileBanner(png, {
      width: 1500,
      height: 500,
    });
    this.logger.log('Profile banner updated on X/Twitter');
  }
}

function requireConfig(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) {
    throw new InternalServerErrorException(`${key} is not configured`);
  }
  return value;
}
