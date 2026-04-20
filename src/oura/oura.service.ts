import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface DailySleep {
  day: string;
  score: number;
}

export interface SleepSummary {
  latest: DailySleep;
  history: DailySleep[];
}

interface OuraDailySleepResponse {
  data: Array<{ day: string; score: number | null }>;
}

@Injectable()
export class OuraService {
  private readonly logger = new Logger(OuraService.name);
  private readonly http: AxiosInstance;

  constructor(config: ConfigService) {
    const token = config.get<string>('OURA_TOKEN');
    if (!token) {
      throw new InternalServerErrorException('OURA_TOKEN is not configured');
    }
    this.http = axios.create({
      baseURL: 'https://api.ouraring.com/v2',
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15_000,
    });
  }

  async getSleepSummary(days = 7): Promise<SleepSummary> {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const { data } = await this.http.get<OuraDailySleepResponse>(
      '/usercollection/daily_sleep',
      {
        params: {
          start_date: toIsoDate(start),
          end_date: toIsoDate(end),
        },
      },
    );

    const history = data.data
      .filter((d): d is { day: string; score: number } => typeof d.score === 'number')
      .sort((a, b) => a.day.localeCompare(b.day));

    if (history.length === 0) {
      throw new InternalServerErrorException('Oura returned no sleep scores');
    }

    return {
      latest: history[history.length - 1],
      history,
    };
  }
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
