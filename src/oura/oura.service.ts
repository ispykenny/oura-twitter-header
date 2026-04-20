import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface DailyMetric {
  day: string;
  score: number;
}

export interface MetricSummary {
  latest: DailyMetric;
  history: DailyMetric[];
}

export interface SleepSummary extends MetricSummary {}

export interface DailySummary {
  sleep: MetricSummary;
  activity: MetricSummary;
}

interface OuraScoreResponse {
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

  async getSleepSummary(days = 7): Promise<MetricSummary> {
    return this.fetchMetric('/usercollection/daily_sleep', 'sleep', days);
  }

  async getDailySummary(days = 7): Promise<DailySummary> {
    const [sleep, activity] = await Promise.all([
      this.fetchMetric('/usercollection/daily_sleep', 'sleep', days),
      this.fetchMetric('/usercollection/daily_activity', 'activity', days),
    ]);
    return { sleep, activity };
  }

  private async fetchMetric(
    path: string,
    label: string,
    days: number,
  ): Promise<MetricSummary> {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const { data } = await this.http.get<OuraScoreResponse>(path, {
      params: {
        start_date: toIsoDate(start),
        end_date: toIsoDate(end),
      },
    });

    const history = data.data
      .filter((d): d is { day: string; score: number } => typeof d.score === 'number')
      .sort((a, b) => a.day.localeCompare(b.day));

    if (history.length === 0) {
      throw new InternalServerErrorException(`Oura returned no ${label} scores`);
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
