import {
  DEFAULT_POLICY,
  DEFAULT_REMINDER_SETTINGS,
  REMINDER_MODE_OPTIONS,
  TWENTY_TWENTY_TWENTY_BREAK_SECONDS,
  TWENTY_TWENTY_TWENTY_INTERVAL_MINUTES
} from './constants';

describe('DEFAULT_POLICY', () => {
  it('defines the active-reading timeout and fixed reminder interval', () => {
    expect(DEFAULT_POLICY.inactivityTimeoutMs).toBe(3 * 60_000);
    expect(DEFAULT_POLICY.reminderIntervalMs).toBe(20 * 60_000);
  });
});

describe('DEFAULT_REMINDER_SETTINGS', () => {
  it('defaults to the 20-20-20 mode with the fixed 20 minute interval', () => {
    expect(DEFAULT_REMINDER_SETTINGS).toEqual({
      reminderMode: 'twenty-twenty-twenty',
      reminderIntervalMinutes: TWENTY_TWENTY_TWENTY_INTERVAL_MINUTES,
      audioEnabled: true,
      fullscreenReminder: true
    });
    expect(REMINDER_MODE_OPTIONS).toEqual(['twenty-twenty-twenty', 'standard']);
    expect(TWENTY_TWENTY_TWENTY_BREAK_SECONDS).toBe(20);
  });
});
