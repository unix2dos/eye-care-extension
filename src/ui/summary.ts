import { DEFAULT_POLICY } from '../shared/constants';
import type { DayStats, RuntimeStatusSnapshot, StatsState } from '../shared/types';

export interface StatsSummary {
  todayReadingMinutes: number;
  todayReminderCount: number;
}

export interface ReminderStatusSummary {
  readingStatusLabel: string;
  nextEligibleReminderLabel: string;
  statusExplanationLabel: string;
  countdownAdvancing: boolean;
}

export interface RuntimeStatusDetail {
  label: string;
  value: string;
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

function formatElapsedSince(timestamp: number | null, now: number): string {
  if (timestamp === null) {
    return '暂无';
  }

  const elapsedMs = Math.max(0, now - timestamp);
  const totalSeconds = Math.floor(elapsedMs / 1_000);

  if (totalSeconds < 60) {
    return `${totalSeconds}秒前`;
  }

  return `${formatCompactDuration(elapsedMs)}前`;
}

function getStatusExplanation(snapshot: RuntimeStatusSnapshot): string {
  if (!snapshot.isSupportedPage) {
    return '当前页不是微信读书阅读页';
  }

  if (!snapshot.isDocumentVisible) {
    return '页面不在前台，返回后继续计时';
  }

  if (!snapshot.isActiveReading) {
    return `最近 ${Math.floor((snapshot.inactivityTimeoutMs || DEFAULT_POLICY.inactivityTimeoutMs) / 60_000)} 分钟没有阅读操作`;
  }

  return '正在累计活跃阅读时间';
}

function formatNextEligibleReminder(nextEligibleReminderAt: number, now: number): string {
  return `${formatCompactDuration(nextEligibleReminderAt - now)}后`;
}

export function buildRuntimeStatusDetails(snapshot: RuntimeStatusSnapshot, now: number): RuntimeStatusDetail[] {
  return [
    { label: '页面支持', value: snapshot.isSupportedPage ? '是' : '否' },
    { label: '页面可见', value: snapshot.isSupportedPage && snapshot.isDocumentVisible ? '是' : '否' },
    { label: '当前计时', value: snapshot.isActiveReading ? '是' : '否' },
    { label: '最近操作', value: formatElapsedSince(snapshot.lastInteractionAt, now) },
    { label: '倒计时推进', value: snapshot.isActiveReading ? '是' : '否' }
  ];
}

export function buildReminderStatusSummary(snapshot: RuntimeStatusSnapshot, now: number): ReminderStatusSummary {
  const isActiveReading = snapshot.isActiveReading ?? false;
  const nextEligibleReminderAt = snapshot.nextEligibleReminderAt;
  const activeReadingTimeMs = snapshot.activeReadingTimeMs ?? 0;

  return {
    readingStatusLabel: buildReadingStatusLabel(isActiveReading, activeReadingTimeMs),
    nextEligibleReminderLabel: !isActiveReading
      ? '等待开始阅读'
      : nextEligibleReminderAt !== null && nextEligibleReminderAt > now
        ? formatNextEligibleReminder(nextEligibleReminderAt, now)
        : '可立即触发',
    statusExplanationLabel: getStatusExplanation(snapshot),
    countdownAdvancing: isActiveReading
  };
}
