export const DEFAULT_POLICY = {
  focusThresholdMs: 20_000,
  blinkWindowMs: 60_000,
  lowBlinkRatio: 0.6,
  reminderCooldownMs: 3 * 60_000,
  recoveryBlinkCount: 3,
  recoveryWindowMs: 10_000,
  inactivityTimeoutMs: 3 * 60_000,
  fallbackReminderIntervalMs: 20 * 60_000,
  calibrationDurationMs: 45_000
} as const;
