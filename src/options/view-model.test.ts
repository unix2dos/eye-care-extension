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
      mode: 'vision'
    };

    const viewModel = buildOptionsViewModel(state, '2026-03-13');

    expect(viewModel.modeLabel).toBe('视觉检测');
    expect(viewModel.calibrationLabel).toContain('2026-03-13');
    expect(viewModel.calibrationSamplesLabel).toBe('120 个采样点');
    expect(viewModel.summary.todayReadingMinutes).toBe(5);
  });

  it('shows an uncalibrated label when calibration is missing', () => {
    const state: PersistedState = {
      calibration: null,
      stats: createEmptyStatsState(),
      mode: 'fallback'
    };

    const viewModel = buildOptionsViewModel(state, '2026-03-13');

    expect(viewModel.modeLabel).toBe('定时提醒');
    expect(viewModel.calibrationLabel).toBe('未完成校准');
    expect(viewModel.calibrationSamplesLabel).toBe('暂无采样');
  });
});
