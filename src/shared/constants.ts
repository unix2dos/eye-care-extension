import type { ReminderSettings } from './types';

export const DEFAULT_POLICY = {
  inactivityTimeoutMs: 3 * 60_000,
  reminderIntervalMs: 20 * 60_000
} as const;

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  reminderIntervalMinutes: 20,
  audioEnabled: true,
  fullscreenReminder: true
};

export const REMINDER_INTERVAL_OPTIONS = [15, 20, 30] as const;
