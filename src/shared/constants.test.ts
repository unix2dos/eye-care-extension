import { DEFAULT_POLICY } from './constants';

describe('DEFAULT_POLICY', () => {
  it('defines the active-reading timeout and fixed reminder interval', () => {
    expect(DEFAULT_POLICY.inactivityTimeoutMs).toBe(3 * 60_000);
    expect(DEFAULT_POLICY.reminderIntervalMs).toBe(20 * 60_000);
  });
});
