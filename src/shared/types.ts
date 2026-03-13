export interface ReminderPolicyConfig {
  focusThresholdMs: number;
  blinkWindowMs: number;
  lowBlinkRatio: number;
  reminderCooldownMs: number;
  recoveryBlinkCount: number;
  recoveryWindowMs: number;
  inactivityTimeoutMs: number;
  fallbackReminderIntervalMs: number;
  calibrationDurationMs: number;
}

export interface VisionReminderInput {
  focusStartAt: number | null;
  now: number;
  blinkCountInWindow: number;
  baselineBlinkRatePerMinute: number | null;
  lastReminderEndedAt: number | null;
}

export interface FallbackReminderInput {
  activeReadingSince: number | null;
  now: number;
  lastReminderEndedAt: number | null;
}

export interface DismissReminderInput {
  reminderStartedAt: number;
  now: number;
  blinksSinceReminder: number;
}

export interface ReadingSample {
  date: string;
  bookTitle: string;
  readingTimeMs: number;
  blinkRatePerMinute: number | null;
  lowBlinkDurationMs: number;
}

export interface ReminderOutcome {
  date: string;
  bookTitle: string;
  recoveryTimeMs: number;
  recovered: boolean;
}

export interface BookStats {
  title: string;
  readingTimeMs: number;
  reminderCount: number;
  blinkRateSampleSum: number;
  blinkRateSampleCount: number;
  averageBlinkRatePerMinute: number | null;
  recoverySuccessCount: number;
  recoveryTimeMsSum: number;
  recoverySampleCount: number;
  averageRecoveryTimeMs: number | null;
}

export interface DayStats {
  date: string;
  readingTimeMs: number;
  reminderCount: number;
  blinkRateSampleSum: number;
  blinkRateSampleCount: number;
  averageBlinkRatePerMinute: number | null;
  lowBlinkDurationMs: number;
  recoverySuccessCount: number;
  recoveryTimeMsSum: number;
  recoverySampleCount: number;
  averageRecoveryTimeMs: number | null;
  books: Record<string, BookStats>;
}

export interface StatsState {
  days: Record<string, DayStats>;
}

export interface CalibrationProfile {
  blinkRatePerMinute: number;
  blinkThreshold: number;
  averageOpenEar: number;
  calibratedAt: string;
  sampleCount: number;
}

export type RuntimeMode = 'vision' | 'fallback';
export type ReminderStrategyPreset = 'conservative' | 'standard' | 'sensitive';
export type RuntimeIssueCode =
  | 'none'
  | 'permission-denied'
  | 'browser-unsupported'
  | 'device-unavailable'
  | 'vision-load-failed'
  | 'calibration-failed';

export interface PersistedState {
  calibration: CalibrationProfile | null;
  stats: StatsState;
  mode: RuntimeMode;
  strategyPreset: ReminderStrategyPreset;
  lastRuntimeIssue: RuntimeIssueCode;
  nextEligibleReminderAt: number | null;
}

export interface StorageAreaLike {
  get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}
