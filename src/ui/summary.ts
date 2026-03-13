import type { DayStats, StatsState } from '../shared/types';

export interface StatsTrendPoint {
  date: string;
  readingMinutes: number;
  reminderCount: number;
  averageBlinkRatePerMinute: number | null;
}

export interface StatsSummary {
  todayReadingMinutes: number;
  totalReadingMinutes: number;
  todayReminderCount: number;
  totalReminderCount: number;
  recoverySuccessRate: number | null;
  trend: StatsTrendPoint[];
}

function getSortedDays(state: StatsState): DayStats[] {
  return Object.values(state.days).sort((left, right) => left.date.localeCompare(right.date));
}

export function buildStatsSummary(state: StatsState, todayDate: string): StatsSummary {
  const days = getSortedDays(state);
  const today = state.days[todayDate];

  const totalReadingMinutes = days.reduce((sum, day) => sum + day.readingTimeMs, 0) / 60_000;
  const totalReminderCount = days.reduce((sum, day) => sum + day.reminderCount, 0);
  const totalRecovered = days.reduce((sum, day) => sum + day.recoverySuccessCount, 0);

  return {
    todayReadingMinutes: Math.round((today?.readingTimeMs ?? 0) / 60_000),
    totalReadingMinutes: Math.round(totalReadingMinutes),
    todayReminderCount: today?.reminderCount ?? 0,
    totalReminderCount,
    recoverySuccessRate: totalReminderCount === 0 ? null : totalRecovered / totalReminderCount,
    trend: days.map((day) => ({
      date: day.date,
      readingMinutes: Math.round(day.readingTimeMs / 60_000),
      reminderCount: day.reminderCount,
      averageBlinkRatePerMinute: day.averageBlinkRatePerMinute
    }))
  };
}
