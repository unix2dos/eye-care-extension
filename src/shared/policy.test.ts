import { DEFAULT_POLICY } from './constants';
import { shouldDismissReminder, shouldTriggerFallbackReminder, shouldTriggerVisionReminder } from './policy';

describe('shouldTriggerVisionReminder', () => {
  it('triggers when stare duration is long enough and blink rate drops below baseline ratio', () => {
    expect(
      shouldTriggerVisionReminder(
        {
          focusStartAt: 0,
          now: 25_000,
          blinkCountInWindow: 8,
          baselineBlinkRatePerMinute: 20,
          lastReminderEndedAt: null
        },
        DEFAULT_POLICY
      )
    ).toBe(true);
  });

  it('does not trigger during the cooldown window', () => {
    expect(
      shouldTriggerVisionReminder(
        {
          focusStartAt: 0,
          now: 25_000,
          blinkCountInWindow: 6,
          baselineBlinkRatePerMinute: 20,
          lastReminderEndedAt: 24_000
        },
        DEFAULT_POLICY
      )
    ).toBe(false);
  });
});

describe('shouldDismissReminder', () => {
  it('dismisses after three blinks inside the recovery window', () => {
    expect(
      shouldDismissReminder(
        {
          reminderStartedAt: 100_000,
          now: 108_000,
          blinksSinceReminder: 3
        },
        DEFAULT_POLICY
      )
    ).toBe(true);
  });
});

describe('shouldTriggerFallbackReminder', () => {
  it('triggers after the fallback interval with no cooldown conflict', () => {
    expect(
      shouldTriggerFallbackReminder(
        {
          activeReadingSince: 0,
          now: 21 * 60_000,
          lastReminderEndedAt: null
        },
        DEFAULT_POLICY
      )
    ).toBe(true);
  });
});
