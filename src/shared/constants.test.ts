import { DEFAULT_POLICY } from './constants';

describe('DEFAULT_POLICY', () => {
  it('defines the MVP thresholds', () => {
    expect(DEFAULT_POLICY.focusThresholdMs).toBe(20_000);
    expect(DEFAULT_POLICY.blinkWindowMs).toBe(60_000);
    expect(DEFAULT_POLICY.lowBlinkRatio).toBe(0.6);
  });
});
