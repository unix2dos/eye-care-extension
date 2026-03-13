import { buildReminderStatusSummary, buildStatsSummary } from './summary';
import { createEmptyStatsState, recordReadingSample, recordReminderTriggered } from '../shared/stats';
import type { PersistedState } from '../shared/types';

describe('buildStatsSummary', () => {
  it('builds only the minimal reading metrics for popup and options views', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-12',
      bookTitle: '变量',
      readingTimeMs: 600_000
    });
    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '变量',
      readingTimeMs: 300_000
    });
    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '变量'
    });

    expect(buildStatsSummary(state, '2026-03-13')).toEqual({
      todayReadingMinutes: 5,
      todayReminderCount: 1
    });
  });

  it('shows the next reminder time while active reading is accumulating', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 10 * 60_000,
      isActiveReading: true,
      nextEligibleReminderAt: new Date('2026-03-13T14:32:00+08:00').getTime()
    } as PersistedState;

    const summary = buildReminderStatusSummary(state, new Date('2026-03-13T14:30:00+08:00').getTime());

    expect(summary).toEqual({
      readingStatusLabel: '正在累计阅读',
      nextEligibleReminderLabel: '14:32'
    });
  });

  it('shows waiting to start reading when the session is inactive', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: false,
      nextEligibleReminderAt: null
    } as PersistedState;

    const summary = buildReminderStatusSummary(state, new Date('2026-03-13T14:30:00+08:00').getTime());

    expect(summary).toEqual({
      readingStatusLabel: '等待开始阅读',
      nextEligibleReminderLabel: '等待开始阅读'
    });
  });

  it('shows ready now when the reminder is due during active reading', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 20 * 60_000,
      isActiveReading: true,
      nextEligibleReminderAt: null
    } as PersistedState;

    const summary = buildReminderStatusSummary(state, new Date('2026-03-13T14:30:00+08:00').getTime());

    expect(summary.nextEligibleReminderLabel).toBe('可立即触发');
  });
});
