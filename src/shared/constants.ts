import type { ReminderMode, ReminderSettings } from './types';

export const DEFAULT_POLICY = {
  inactivityTimeoutMs: 3 * 60_000,
  reminderIntervalMs: 20 * 60_000
} as const;

export const TWENTY_TWENTY_TWENTY_INTERVAL_MINUTES = 20 as const;
export const TWENTY_TWENTY_TWENTY_BREAK_SECONDS = 20 as const;
export const REMINDER_MODE_OPTIONS = ['twenty-twenty-twenty', 'standard'] as const satisfies readonly ReminderMode[];
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  reminderMode: 'twenty-twenty-twenty',
  reminderIntervalMinutes: TWENTY_TWENTY_TWENTY_INTERVAL_MINUTES,
  audioEnabled: true,
  fullscreenReminder: true
};

export const REMINDER_INTERVAL_OPTIONS = [15, 20, 30] as const;
