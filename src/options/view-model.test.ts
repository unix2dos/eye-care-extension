import { buildOptionsViewModel } from './view-model';
import { createEmptyStatsState, recordReadingSample, recordReminderTriggered, recordReminderRecovery } from '../shared/stats';
import type { PersistedState } from '../shared/types';

describe('buildOptionsViewModel', () => {
  it('exposes runtime mode and calibration details alongside summary stats', () => {
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-13',
      bookTitle: '变量',
      readingTimeMs: 300_000,
      blinkRatePerMinute: 18,
      lowBlinkDurationMs: 30_000
    });
    recordReminderTriggered(stats, {
      date: '2026-03-13',
      bookTitle: '变量'
    });
    recordReminderRecovery(stats, {
      date: '2026-03-13',
      bookTitle: '变量',
      recoveryTimeMs: 8_000,
      recovered: true
    });

    const state: PersistedState = {
      calibration: {
        blinkRatePerMinute: 18,
        blinkThreshold: 0.24,
        averageOpenEar: 0.32,
        calibratedAt: '2026-03-13T08:30:00.000Z',
        sampleCount: 120
      },
      stats,
      mode: 'vision',
      strategyPreset: 'standard',
      lastRuntimeIssue: 'none',
      nextEligibleReminderAt: null
    };

    const viewModel = buildOptionsViewModel(state, '2026-03-13');

    expect(viewModel.modeLabel).toBe('视觉检测');
    expect(viewModel.calibrationLabel).toContain('2026-03-13');
    expect(viewModel.calibrationSamplesLabel).toBe('120 个采样点');
    expect(viewModel.selectedStrategyLabel).toBe('标准');
    expect(viewModel.strategyOptions).toHaveLength(3);
    expect(viewModel.runtimeIssueTitle).toBe('运行正常');
    expect(viewModel.summary.todayReadingMinutes).toBe(5);
  });

  it('shows an uncalibrated label when calibration is missing', () => {
    const state: PersistedState = {
      calibration: null,
      stats: createEmptyStatsState(),
      mode: 'fallback',
      strategyPreset: 'sensitive',
      lastRuntimeIssue: 'permission-denied',
      nextEligibleReminderAt: new Date('2026-03-13T14:32:00+08:00').getTime()
    };

    const viewModel = buildOptionsViewModel(state, '2026-03-13');

    expect(viewModel.modeLabel).toBe('定时提醒');
    expect(viewModel.calibrationLabel).toBe('未完成校准');
    expect(viewModel.calibrationSamplesLabel).toBe('暂无采样');
    expect(viewModel.selectedStrategyLabel).toBe('敏感');
    expect(viewModel.runtimeIssueTitle).toBe('摄像头权限被拒绝');
    expect(viewModel.runtimeIssueGuidance).toBe('请在当前站点的摄像头权限里选择允许，然后刷新页面重试。');
  });
});
