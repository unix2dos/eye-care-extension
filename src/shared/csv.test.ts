import { exportBookStatsCsv } from './csv';
import { createEmptyStatsState, recordReadingSample, recordReminderRecovery, recordReminderTriggered } from './stats';

describe('exportBookStatsCsv', () => {
  it('includes the required per-book columns', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '阅读的方法',
      readingTimeMs: 300_000,
      blinkRatePerMinute: 16,
      lowBlinkDurationMs: 45_000
    });
    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '阅读的方法'
    });
    recordReminderRecovery(state, {
      date: '2026-03-13',
      bookTitle: '阅读的方法',
      recoveryTimeMs: 8_000,
      recovered: true
    });

    const csv = exportBookStatsCsv(state);
    const [header, row] = csv.trim().split('\n');

    expect(header).toBe(
      'date,bookTitle,readingMinutes,reminderCount,averageBlinkRatePerMinute,recoverySuccessCount,averageRecoverySeconds'
    );
    expect(row).toContain('2026-03-13');
    expect(row).toContain('阅读的方法');
    expect(row).toContain('5');
  });
});
