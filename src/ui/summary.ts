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

function formatActiveReadingMinutes(activeReadingTimeMs: number): number {
  return Math.max(0, Math.floor(activeReadingTimeMs / 60_000));
}

function buildReadingStatusLabel(isActiveReading: boolean, activeReadingTimeMs: number): string {
  const minutes = formatActiveReadingMinutes(activeReadingTimeMs);
  const prefix = isActiveReading ? '正在计时' : '已暂停计时';

  return `${prefix}（本轮计时 ${minutes} 分钟）`;
}

export function buildReminderStatusSummary(state: PersistedState, now: number): ReminderStatusSummary {
  const isActiveReading = state.isActiveReading ?? false;
  const nextEligibleReminderAt = state.nextEligibleReminderAt;
  const activeReadingTimeMs = state.activeReadingTimeMs ?? 0;

  return {
    readingStatusLabel: buildReadingStatusLabel(isActiveReading, activeReadingTimeMs),
    nextEligibleReminderLabel: !isActiveReading
      ? '等待开始阅读'
      : nextEligibleReminderAt !== null && nextEligibleReminderAt > now
        ? formatNextEligibleReminder(nextEligibleReminderAt)
        : '可立即触发'
  };
}
