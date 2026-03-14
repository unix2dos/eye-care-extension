import { describe, expect, it } from 'vitest';

import { ActiveReadingReminderScheduler } from './scheduler';

describe('ActiveReadingReminderScheduler', () => {
  it('accumulates only active reading time and triggers after 20 minutes', () => {
    const scheduler = new ActiveReadingReminderScheduler(20 * 60_000);

    expect(scheduler.update(0, false)).toMatchObject({
      activeReadingTimeMs: 0,
      nextReminderAt: null,
      reminderDue: false
    });

    expect(scheduler.update(1_000, true).activeReadingTimeMs).toBe(0);
    expect(scheduler.update(10 * 60_000 + 1_000, true)).toMatchObject({
      activeReadingTimeMs: 10 * 60_000,
      reminderDue: false
    });

    expect(scheduler.update(15 * 60_000 + 1_000, false)).toMatchObject({
      activeReadingTimeMs: 10 * 60_000,
      nextReminderAt: null,
      reminderDue: false
    });

    const due = scheduler.update(25 * 60_000 + 1_000, true);
    expect(due.activeReadingTimeMs).toBe(10 * 60_000);
    expect(due.reminderDue).toBe(false);

    const triggered = scheduler.update(35 * 60_000 + 1_000, true);
    expect(triggered.activeReadingTimeMs).toBe(20 * 60_000);
    expect(triggered.reminderDue).toBe(true);
    expect(triggered.nextReminderAt).toBe(35 * 60_000 + 1_000);
  });

  it('resets the cycle after a reminder is acknowledged', () => {
    const scheduler = new ActiveReadingReminderScheduler(20 * 60_000, 20 * 60_000);

    scheduler.update(1_000, true);
    const due = scheduler.update(20 * 60_000 + 1_000, true);

    expect(due.reminderDue).toBe(true);

    scheduler.markReminderTriggered(20 * 60_000 + 1_000);
    const afterReset = scheduler.update(25 * 60_000 + 1_000, true);

    expect(afterReset.activeReadingTimeMs).toBe(5 * 60_000);
    expect(afterReset.reminderDue).toBe(false);
    expect(afterReset.nextReminderAt).toBe(40 * 60_000 + 1_000);
  });

  it('recalculates the next reminder when the interval setting changes', () => {
    const scheduler = new ActiveReadingReminderScheduler(20 * 60_000);

    scheduler.update(1_000, true);
    const before = scheduler.update(10 * 60_000 + 1_000, true);
    expect(before.nextReminderAt).toBe(20 * 60_000 + 1_000);

    scheduler.setReminderIntervalMs(30 * 60_000);
    const after = scheduler.update(10 * 60_000 + 1_000, true);

    expect(after.activeReadingTimeMs).toBe(10 * 60_000);
    expect(after.reminderDue).toBe(false);
    expect(after.nextReminderAt).toBe(30 * 60_000 + 1_000);
  });
});
