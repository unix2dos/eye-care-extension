import {
  createEmptyStatsState,
  recordReadingSample,
  recordReminderRecovery,
  recordReminderTriggered
} from './stats';

describe('stats aggregation', () => {
  it('aggregates daily and per-book reading samples', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '刘擎西方现代思想讲义',
      readingTimeMs: 120_000,
      blinkRatePerMinute: 18,
      lowBlinkDurationMs: 30_000
    });

    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '刘擎西方现代思想讲义',
      readingTimeMs: 60_000,
      blinkRatePerMinute: 12,
      lowBlinkDurationMs: 10_000
    });

    const day = state.days['2026-03-13'];
    expect(day.readingTimeMs).toBe(180_000);
    expect(day.lowBlinkDurationMs).toBe(40_000);
    expect(day.averageBlinkRatePerMinute).toBe(15);
    expect(day.books['刘擎西方现代思想讲义']?.readingTimeMs).toBe(180_000);
  });

  it('records reminder outcomes and recovery effectiveness', () => {
    const state = createEmptyStatsState();

    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '置身事内'
    });
    recordReminderRecovery(state, {
      date: '2026-03-13',
      bookTitle: '置身事内',
      recoveryTimeMs: 9_000,
      recovered: true
    });

    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '置身事内'
    });
    recordReminderRecovery(state, {
      date: '2026-03-13',
      bookTitle: '置身事内',
      recoveryTimeMs: 0,
      recovered: false
    });

    const day = state.days['2026-03-13'];
    expect(day.reminderCount).toBe(2);
    expect(day.recoverySuccessCount).toBe(1);
    expect(day.averageRecoveryTimeMs).toBe(9_000);
    expect(day.books['置身事内']?.reminderCount).toBe(2);
  });
});
