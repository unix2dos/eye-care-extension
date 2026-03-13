import { buildOptionsViewModel } from './view-model';
import { createEmptyStatsState, recordReadingSample, recordReminderTriggered } from '../shared/stats';
import type { PersistedState } from '../shared/types';

describe('buildOptionsViewModel', () => {
  it('exposes only the minimal reading reminder status and today summary', () => {
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-13',
      bookTitle: '变量',
      readingTimeMs: 300_000
    });
    recordReminderTriggered(stats, {
      date: '2026-03-13',
      bookTitle: '变量'
    });

    const state = {
      stats,
      activeReadingTimeMs: 5 * 60_000,
      isActiveReading: true,
      nextEligibleReminderAt: new Date('2026-03-13T14:32:00+08:00').getTime()
    } as PersistedState;

    const viewModel = buildOptionsViewModel(state, '2026-03-13', new Date('2026-03-13T14:30:00+08:00').getTime());

    expect(viewModel).toEqual({
      readingStatusLabel: '正在累计阅读',
      nextReminderLabel: '14:32',
      summary: {
        todayReadingMinutes: 5,
        todayReminderCount: 1
      }
    });
  });

  it('shows waiting to start reading when the session is inactive', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: false,
      nextEligibleReminderAt: null
    } as PersistedState;

    const viewModel = buildOptionsViewModel(state, '2026-03-13');

    expect(viewModel.readingStatusLabel).toBe('等待开始阅读');
    expect(viewModel.nextReminderLabel).toBe('等待开始阅读');
  });
});
