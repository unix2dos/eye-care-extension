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

function formatCompactDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}分${String(seconds).padStart(2, '0')}秒`;
}

function buildReadingStatusLabel(isActiveReading: boolean, activeReadingTimeMs: number): string {
  const duration = formatCompactDuration(activeReadingTimeMs);
  const prefix = isActiveReading ? '计时中' : '已暂停';

  return `${prefix} · ${duration}`;
}

function formatNextEligibleReminder(nextEligibleReminderAt: number, now: number): string {
  return `${formatCompactDuration(nextEligibleReminderAt - now)}后`;
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
        ? formatNextEligibleReminder(nextEligibleReminderAt, now)
        : '可立即触发'
  };
}
