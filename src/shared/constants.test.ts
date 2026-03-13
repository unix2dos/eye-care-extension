import { DEFAULT_POLICY } from './constants';
import { getPolicyForStrategy } from './strategy';

describe('DEFAULT_POLICY', () => {
  it('keeps the standard strategy aligned with the default thresholds', () => {
    expect(DEFAULT_POLICY.focusThresholdMs).toBe(20_000);
    expect(DEFAULT_POLICY.blinkWindowMs).toBe(60_000);
    expect(DEFAULT_POLICY.lowBlinkRatio).toBe(0.6);
    expect(DEFAULT_POLICY.reminderCooldownMs).toBe(3 * 60_000);
    expect(DEFAULT_POLICY.fallbackReminderIntervalMs).toBe(20 * 60_000);

    expect(getPolicyForStrategy('standard')).toEqual(DEFAULT_POLICY);
  });
});
