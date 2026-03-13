import { describe, expect, it } from 'vitest';

import { STRATEGY_PRESETS, getPolicyForStrategy, getStrategyMeta } from './strategy';
import type { RuntimeIssueCode } from './types';

describe('STRATEGY_PRESETS', () => {
  it('defines the three supported reminder strategies with user-facing copy', () => {
    expect(STRATEGY_PRESETS.map((preset) => preset.id)).toEqual([
      'conservative',
      'standard',
      'sensitive'
    ]);
    expect(getStrategyMeta('conservative').description).toBe('更少打扰，提醒更晚');
    expect(getStrategyMeta('standard').description).toBe('平衡提醒频率和准确性');
    expect(getStrategyMeta('sensitive').description).toBe('更早提醒，更容易触发');
  });

  it('maps each strategy to the expected policy values', () => {
    expect(getPolicyForStrategy('conservative')).toMatchObject({
      focusThresholdMs: 30_000,
      lowBlinkRatio: 0.5,
      reminderCooldownMs: 5 * 60_000,
      fallbackReminderIntervalMs: 30 * 60_000
    });
    expect(getPolicyForStrategy('standard')).toMatchObject({
      focusThresholdMs: 20_000,
      lowBlinkRatio: 0.6,
      reminderCooldownMs: 3 * 60_000,
      fallbackReminderIntervalMs: 20 * 60_000
    });
    expect(getPolicyForStrategy('sensitive')).toMatchObject({
      focusThresholdMs: 15_000,
      lowBlinkRatio: 0.75,
      reminderCooldownMs: 2 * 60_000,
      fallbackReminderIntervalMs: 15 * 60_000
    });
  });

  it('keeps runtime issue ids stable for UI rendering', () => {
    const issueCodes: RuntimeIssueCode[] = [
      'none',
      'permission-denied',
      'browser-unsupported',
      'device-unavailable',
      'vision-load-failed',
      'calibration-failed'
    ];

    expect(issueCodes).toHaveLength(6);
  });
});
