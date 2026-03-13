import { buildStatsSummary } from '../ui/summary';
import type { PersistedState } from '../shared/types';

export interface OptionsViewModel {
  modeLabel: string;
  calibrationLabel: string;
  calibrationSamplesLabel: string;
  summary: ReturnType<typeof buildStatsSummary>;
}

function formatCalibrationLabel(calibratedAt: string | null): string {
  if (!calibratedAt) {
    return '未完成校准';
  }

  return new Date(calibratedAt).toISOString().replace('T', ' ').slice(0, 16);
}

export function buildOptionsViewModel(state: PersistedState, todayDate: string): OptionsViewModel {
  return {
    modeLabel: state.mode === 'vision' ? '视觉检测' : '定时提醒',
    calibrationLabel: formatCalibrationLabel(state.calibration?.calibratedAt ?? null),
    calibrationSamplesLabel: state.calibration ? `${state.calibration.sampleCount} 个采样点` : '暂无采样',
    summary: buildStatsSummary(state.stats, todayDate)
  };
}
