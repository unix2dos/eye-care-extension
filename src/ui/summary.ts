import type { DayStats, PersistedState, StatsState } from '../shared/types';

export interface StatsSummary {
  todayReadingMinutes: number;
  todayReminderCount: number;
}

export interface ReminderStatusSummary {
  readingStatusLabel: string;
  nextEligibleReminderLabel: string;
}

function getSortedDays(state: StatsState): DayStats[] {
  return Object.values(state.days).sort((left, right) => left.date.localeCompare(right.date));
}

export function buildStatsSummary(state: StatsState, todayDate: string): StatsSummary {
  const today = state.days[todayDate];

  return {
    todayReadingMinutes: Math.round((today?.readingTimeMs ?? 0) / 60_000),
    todayReminderCount: today?.reminderCount ?? 0
  };
}

function formatNextEligibleReminder(nextEligibleReminderAt: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(nextEligibleReminderAt));
}

export function buildReminderStatusSummary(state: PersistedState, now: number): ReminderStatusSummary {
  const isActiveReading = state.isActiveReading ?? false;
  const nextEligibleReminderAt = state.nextEligibleReminderAt;

  return {
    readingStatusLabel: isActiveReading ? '正在累计阅读' : '等待开始阅读',
    nextEligibleReminderLabel: !isActiveReading
      ? '等待开始阅读'
      : nextEligibleReminderAt !== null && nextEligibleReminderAt > now
        ? formatNextEligibleReminder(nextEligibleReminderAt)
        : '可立即触发'
  };
}
