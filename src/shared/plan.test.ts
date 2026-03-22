import { describe, expect, it } from 'vitest';

import {
  canUseBreakGuideAnimation,
  canUseCustomReminderInterval,
  canUsePdfExport,
  clampReportRangeDays,
  sanitizeReminderSettingsForPlan
} from './plan';
import type { ReminderSettings } from './types';

const baseSettings: ReminderSettings = {
  reminderMode: 'standard',
  reminderIntervalMinutes: 30,
  audioEnabled: true,
  fullscreenReminder: true
};

describe('plan helpers', () => {
  it('locks pro-only features on the free plan', () => {
    expect(canUseBreakGuideAnimation('free')).toBe(false);
    expect(canUsePdfExport('free')).toBe(false);
    expect(canUseCustomReminderInterval('free')).toBe(false);
    expect(clampReportRangeDays(30, 'free')).toBe(7);
  });

  it('unlocks pro-only features on the pro plan', () => {
    expect(canUseBreakGuideAnimation('pro')).toBe(true);
    expect(canUsePdfExport('pro')).toBe(true);
    expect(canUseCustomReminderInterval('pro')).toBe(true);
    expect(clampReportRangeDays(30, 'pro')).toBe(30);
  });

  it('falls back to the default preset interval when free plan receives a custom interval', () => {
    expect(
      sanitizeReminderSettingsForPlan(
        {
          ...baseSettings,
          reminderIntervalMinutes: 45
        },
        'free'
      )
    ).toMatchObject({
      reminderIntervalMinutes: 20
    });
  });

  it('keeps a valid custom interval on the pro plan', () => {
    expect(
      sanitizeReminderSettingsForPlan(
        {
          ...baseSettings,
          reminderIntervalMinutes: 45
        },
        'pro'
      )
    ).toMatchObject({
      reminderIntervalMinutes: 45
    });
  });
});
