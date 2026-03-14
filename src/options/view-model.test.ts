import { buildOptionsViewModel } from './view-model';
import { createEmptyStatsState, recordReadingSample, recordReminderTriggered } from '../shared/stats';
import type { PersistedState, RuntimeStatusSnapshot } from '../shared/types';

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
      activeReadingTimeMs: 5 * 60_000 + 12_000,
      isActiveReading: true,
      nextEligibleReminderAt: new Date('2026-03-13T14:32:18+08:00').getTime(),
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      },
      isSupportedPage: true,
      isDocumentVisible: true,
      lastInteractionAt: new Date('2026-03-13T14:29:54+08:00').getTime(),
      inactivityTimeoutMs: 3 * 60_000
    } as PersistedState;
    const runtimeStatus = state as PersistedState & RuntimeStatusSnapshot;

    const viewModel = buildOptionsViewModel(
      state,
      runtimeStatus,
      '2026-03-13',
      new Date('2026-03-13T14:30:00+08:00').getTime()
    );

    expect(viewModel).toEqual({
      readingStatusLabel: '计时中 · 5分12秒',
      nextReminderLabel: '2分18秒后',
      statusExplanationLabel: '正在累计活跃阅读时间',
      runtimeDetails: [
        { label: '页面支持', value: '是' },
        { label: '页面可见', value: '是' },
        { label: '当前计时', value: '是' },
        { label: '最近操作', value: '6秒前' },
        { label: '倒计时推进', value: '是' }
      ],
      summary: {
        todayReadingMinutes: 5,
        todayReminderCount: 1
      }
    });
  });

  it('shows waiting to start reading when the session is inactive', () => {
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 12 * 60_000,
      isActiveReading: false,
      nextEligibleReminderAt: null,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      },
      isSupportedPage: true,
      isDocumentVisible: false,
      lastInteractionAt: new Date('2026-03-13T14:27:30+08:00').getTime(),
      inactivityTimeoutMs: 3 * 60_000
    } as PersistedState;
    const runtimeStatus = state as PersistedState & RuntimeStatusSnapshot;

    const viewModel = buildOptionsViewModel(
      state,
      runtimeStatus,
      '2026-03-13',
      new Date('2026-03-13T14:30:00+08:00').getTime()
    );

    expect(viewModel.readingStatusLabel).toBe('已暂停 · 12分00秒');
    expect(viewModel.nextReminderLabel).toBe('等待开始阅读');
    expect(viewModel.statusExplanationLabel).toBe('页面不在前台，返回后继续计时');
    expect(viewModel.runtimeDetails).toEqual([
      { label: '页面支持', value: '是' },
      { label: '页面可见', value: '否' },
      { label: '当前计时', value: '否' },
      { label: '最近操作', value: '2分30秒前' },
      { label: '倒计时推进', value: '否' }
    ]);
  });
});
