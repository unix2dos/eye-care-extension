import { describe, expect, it } from 'vitest';

import { getEffectiveReminderIntervalMinutes, getReminderCountdownSeconds, isTwentyTwentyTwentyMode } from './reminder-mode';
import type { ReminderSettings } from './types';

describe('reminder mode helpers', () => {
  it('uses a fixed 20 minute interval and 20 second countdown in 20-20-20 mode', () => {
    const settings: ReminderSettings = {
      reminderMode: 'twenty-twenty-twenty',
      reminderIntervalMinutes: 30,
      audioEnabled: true,
      fullscreenReminder: true
    };

    expect(isTwentyTwentyTwentyMode(settings)).toBe(true);
    expect(getEffectiveReminderIntervalMinutes(settings)).toBe(20);
    expect(getReminderCountdownSeconds(settings)).toBe(20);
  });

  it('keeps the configurable interval and no forced countdown in standard mode', () => {
    const settings: ReminderSettings = {
      reminderMode: 'standard',
      reminderIntervalMinutes: 30,
      audioEnabled: true,
      fullscreenReminder: false
    };

    expect(isTwentyTwentyTwentyMode(settings)).toBe(false);
    expect(getEffectiveReminderIntervalMinutes(settings)).toBe(30);
    expect(getReminderCountdownSeconds(settings)).toBeNull();
  });
});
