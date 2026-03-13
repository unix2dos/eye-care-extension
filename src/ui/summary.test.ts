import { buildReminderStatusSummary, buildStatsSummary } from './summary';
import { createEmptyStatsState, recordReadingSample, recordReminderRecovery, recordReminderTriggered } from '../shared/stats';
import type { PersistedState } from '../shared/types';

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

  it('builds runtime reminder status for the popup', () => {
    const state: PersistedState = {
      calibration: null,
      stats: createEmptyStatsState(),
      mode: 'fallback',
      strategyPreset: 'sensitive',
      lastRuntimeIssue: 'permission-denied',
      nextEligibleReminderAt: new Date('2026-03-13T14:32:00+08:00').getTime()
    };

    const summary = buildReminderStatusSummary(state, new Date('2026-03-13T14:30:00+08:00').getTime());

    expect(summary.modeLabel).toBe('定时提醒');
    expect(summary.strategyLabel).toBe('敏感');
    expect(summary.strategyDescription).toBe('更早提醒，更容易触发');
    expect(summary.nextEligibleReminderLabel).toBe('14:32');
    expect(summary.runtimeIssueSummary).toBe('摄像头权限被拒绝，当前为定时提醒');
  });

  it('shows ready now when the cooldown has expired', () => {
    const state: PersistedState = {
      calibration: null,
      stats: createEmptyStatsState(),
      mode: 'vision',
      strategyPreset: 'standard',
      lastRuntimeIssue: 'none',
      nextEligibleReminderAt: null
    };

    const summary = buildReminderStatusSummary(state, new Date('2026-03-13T14:30:00+08:00').getTime());

    expect(summary.nextEligibleReminderLabel).toBe('可立即触发');
    expect(summary.runtimeIssueSummary).toBeNull();
  });
});
