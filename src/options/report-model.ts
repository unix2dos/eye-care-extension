import { getEffectiveReminderIntervalMinutes } from '../shared/reminder-mode';
import type { DayStats, ReminderSettings, StatsState } from '../shared/types';

export type ReportRangeDays = 7 | 30;

export const UNKNOWN_DOMAIN_LABEL = '未记录站点';

export interface ReportTrendPoint {
  date: string;
  readingMinutes: number;
  reminderCount: number;
  expectedReminderCount: number;
  complianceRate: number | null;
}

export interface ReportDomainRow {
  domain: string;
  readingMinutes: number;
  reminderCount: number;
  readingShare: number;
}

export interface EyeCareReportModel {
  rangeDays: ReportRangeDays;
  startDate: string;
  endDate: string;
  intervalMinutes: number;
  totalReadingMinutes: number;
  totalReminderCount: number;
  expectedReminderCount: number;
  complianceRate: number | null;
  averageDailyReadingMinutes: number;
  topDomain: string | null;
  trend: ReportTrendPoint[];
  domains: ReportDomainRow[];
  isEmpty: boolean;
}

interface AggregateDomainRow {
  domain: string;
  readingTimeMs: number;
  reminderCount: number;
}

function addDays(date: string, deltaDays: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setDate(value.getDate() + deltaDays);
  return value.toISOString().slice(0, 10);
}

function buildDateRange(endDate: string, rangeDays: ReportRangeDays): string[] {
  return Array.from({ length: rangeDays }, (_, index) => addDays(endDate, index - (rangeDays - 1)));
}

function toRoundedMinutes(readingTimeMs: number): number {
  return Math.round(readingTimeMs / 60_000);
}

function calculateExpectedReminderCount(readingTimeMs: number, intervalMinutes: number): number {
  const intervalMs = Math.max(1, intervalMinutes) * 60_000;
  return Math.floor(Math.max(0, readingTimeMs) / intervalMs);
}

function calculateComplianceRate(actualCount: number, expectedCount: number): number | null {
  if (expectedCount <= 0) {
    return null;
  }

  return Math.min(1, actualCount / expectedCount);
}

function aggregateDomains(days: DayStats[]): AggregateDomainRow[] {
  const rows = new Map<string, AggregateDomainRow>();

  const ensureRow = (domain: string): AggregateDomainRow => {
    const existing = rows.get(domain);
    if (existing) {
      return existing;
    }

    const created: AggregateDomainRow = {
      domain,
      readingTimeMs: 0,
      reminderCount: 0
    };
    rows.set(domain, created);
    return created;
  };

  for (const day of days) {
    for (const domain of Object.values(day.domains)) {
      const row = ensureRow(domain.domain);
      row.readingTimeMs += domain.readingTimeMs;
      row.reminderCount += domain.reminderCount;
    }

    for (const book of Object.values(day.books)) {
      if (book.domain) {
        continue;
      }

      const row = ensureRow(UNKNOWN_DOMAIN_LABEL);
      row.readingTimeMs += book.readingTimeMs;
      row.reminderCount += book.reminderCount;
    }
  }

  return [...rows.values()].sort((left, right) => {
    if (right.readingTimeMs !== left.readingTimeMs) {
      return right.readingTimeMs - left.readingTimeMs;
    }

    return left.domain.localeCompare(right.domain);
  });
}

export function buildEyeCareReportModel(
  stats: StatsState,
  settings: ReminderSettings,
  endDate: string,
  rangeDays: ReportRangeDays
): EyeCareReportModel {
  const intervalMinutes = getEffectiveReminderIntervalMinutes(settings);
  const dates = buildDateRange(endDate, rangeDays);
  const days = dates.map((date) => stats.days[date] ?? null);
  const populatedDays = days.filter((day): day is DayStats => day !== null);
  const totalReadingTimeMs = populatedDays.reduce((sum, day) => sum + day.readingTimeMs, 0);
  const totalReminderCount = populatedDays.reduce((sum, day) => sum + day.reminderCount, 0);
  const expectedReminderCount = populatedDays.reduce(
    (sum, day) => sum + calculateExpectedReminderCount(day.readingTimeMs, intervalMinutes),
    0
  );
  const domains = aggregateDomains(populatedDays);
  const totalReadingMinutes = toRoundedMinutes(totalReadingTimeMs);

  return {
    rangeDays,
    startDate: dates[0],
    endDate,
    intervalMinutes,
    totalReadingMinutes,
    totalReminderCount,
    expectedReminderCount,
    complianceRate: calculateComplianceRate(totalReminderCount, expectedReminderCount),
    averageDailyReadingMinutes: Math.round(totalReadingMinutes / rangeDays),
    topDomain: domains[0]?.domain ?? null,
    trend: dates.map((date) => {
      const day = stats.days[date];
      const readingTimeMs = day?.readingTimeMs ?? 0;
      const reminderCount = day?.reminderCount ?? 0;
      const expectedCount = calculateExpectedReminderCount(readingTimeMs, intervalMinutes);

      return {
        date,
        readingMinutes: toRoundedMinutes(readingTimeMs),
        reminderCount,
        expectedReminderCount: expectedCount,
        complianceRate: calculateComplianceRate(reminderCount, expectedCount)
      };
    }),
    domains: domains.map((domain) => ({
      domain: domain.domain,
      readingMinutes: toRoundedMinutes(domain.readingTimeMs),
      reminderCount: domain.reminderCount,
      readingShare: totalReadingTimeMs > 0 ? domain.readingTimeMs / totalReadingTimeMs : 0
    })),
    isEmpty: totalReadingTimeMs === 0 && totalReminderCount === 0
  };
}
