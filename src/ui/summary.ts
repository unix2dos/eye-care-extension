import { getStrategyMeta } from '../shared/strategy';
import type { DayStats, PersistedState, StatsState } from '../shared/types';
import { getRuntimeIssueCopy } from '../content/runtime/issues';

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

export interface ReminderStatusSummary {
  modeLabel: string;
  strategyLabel: string;
  strategyDescription: string;
  nextEligibleReminderLabel: string;
  runtimeIssueSummary: string | null;
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

function formatNextEligibleReminder(nextEligibleReminderAt: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(nextEligibleReminderAt));
}

export function buildReminderStatusSummary(state: PersistedState, now: number): ReminderStatusSummary {
  const strategy = getStrategyMeta(state.strategyPreset);
  const runtimeIssue = getRuntimeIssueCopy(state.lastRuntimeIssue);

  return {
    modeLabel: state.mode === 'vision' ? '视觉检测' : '定时提醒',
    strategyLabel: strategy.label,
    strategyDescription: strategy.description,
    nextEligibleReminderLabel:
      state.nextEligibleReminderAt !== null && state.nextEligibleReminderAt > now
        ? formatNextEligibleReminder(state.nextEligibleReminderAt)
        : '可立即触发',
    runtimeIssueSummary: runtimeIssue.popupSummary
  };
}
