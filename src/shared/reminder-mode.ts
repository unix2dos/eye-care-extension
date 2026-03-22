import {
  TWENTY_TWENTY_TWENTY_BREAK_SECONDS,
  TWENTY_TWENTY_TWENTY_INTERVAL_MINUTES
} from './constants';
import type { ReminderSettings } from './types';

export function isTwentyTwentyTwentyMode(settings: ReminderSettings): boolean {
  return settings.reminderMode === 'twenty-twenty-twenty';
}

export function getEffectiveReminderIntervalMinutes(settings: ReminderSettings): number {
  return isTwentyTwentyTwentyMode(settings)
    ? TWENTY_TWENTY_TWENTY_INTERVAL_MINUTES
    : settings.reminderIntervalMinutes;
}

export function getReminderCountdownSeconds(settings: ReminderSettings): number | null {
  return isTwentyTwentyTwentyMode(settings) ? TWENTY_TWENTY_TWENTY_BREAK_SECONDS : null;
}
