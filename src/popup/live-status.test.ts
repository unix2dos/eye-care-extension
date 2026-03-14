import { describe, expect, it } from 'vitest';

import type { PersistedState } from '../shared/types';
import { createEmptyStatsState } from '../shared/stats';
import { derivePopupRuntimeState } from './live-status';

describe('derivePopupRuntimeState', () => {
  it('increments the current reading duration while the popup stays open', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 4 * 60_000 + 10_000,
      isActiveReading: true,
      nextEligibleReminderAt: 10_000,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      }
    } as PersistedState;

    const derived = derivePopupRuntimeState(state, 1_000, 4_000);

    expect(derived.activeReadingTimeMs).toBe(4 * 60_000 + 13_000);
    expect(derived.nextEligibleReminderAt).toBe(10_000);
    expect(derived.isActiveReading).toBe(true);
  });

  it('keeps paused sessions unchanged', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 12 * 60_000,
      isActiveReading: false,
      nextEligibleReminderAt: null,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      }
    } as PersistedState;

    const derived = derivePopupRuntimeState(state, 1_000, 6_000);

    expect(derived).toEqual(state);
  });
});
