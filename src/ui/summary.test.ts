import { buildStatsSummary } from './summary';
import { createEmptyStatsState, recordReadingSample, recordReminderRecovery, recordReminderTriggered } from '../shared/stats';

describe('buildStatsSummary', () => {
  it('builds aggregate metrics for popup and options views', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-12',
      bookTitle: '变量',
      readingTimeMs: 600_000,
      blinkRatePerMinute: 16,
      lowBlinkDurationMs: 60_000
    });
    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '变量',
      readingTimeMs: 300_000,
      blinkRatePerMinute: 18,
      lowBlinkDurationMs: 30_000
    });
    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '变量'
    });
    recordReminderRecovery(state, {
      date: '2026-03-13',
      bookTitle: '变量',
      recoveryTimeMs: 8_000,
      recovered: true
    });

    const summary = buildStatsSummary(state, '2026-03-13');

    expect(summary.todayReadingMinutes).toBe(5);
    expect(summary.totalReadingMinutes).toBe(15);
    expect(summary.todayReminderCount).toBe(1);
    expect(summary.totalReminderCount).toBe(1);
    expect(summary.recoverySuccessRate).toBe(1);
    expect(summary.trend.length).toBe(2);
  });
});
