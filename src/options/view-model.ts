import { buildStatsSummary } from '../ui/summary';
import { STRATEGY_PRESETS, getStrategyMeta } from '../shared/strategy';
import type { PersistedState } from '../shared/types';
import { getRuntimeIssueCopy } from '../content/runtime/issues';

export interface OptionsViewModel {
  modeLabel: string;
  calibrationLabel: string;
  calibrationSamplesLabel: string;
  selectedStrategyLabel: string;
  strategyOptions: Array<{
    id: string;
    label: string;
    description: string;
    selected: boolean;
  }>;
  runtimeIssueTitle: string;
  runtimeIssueGuidance: string;
  summary: ReturnType<typeof buildStatsSummary>;
}

function formatCalibrationLabel(calibratedAt: string | null): string {
  if (!calibratedAt) {
    return '未完成校准';
  }

  return new Date(calibratedAt).toISOString().replace('T', ' ').slice(0, 16);
}

export function buildOptionsViewModel(state: PersistedState, todayDate: string): OptionsViewModel {
  const strategy = getStrategyMeta(state.strategyPreset);
  const runtimeIssue = getRuntimeIssueCopy(state.lastRuntimeIssue);

  return {
    modeLabel: state.mode === 'vision' ? '视觉检测' : '定时提醒',
    calibrationLabel: formatCalibrationLabel(state.calibration?.calibratedAt ?? null),
    calibrationSamplesLabel: state.calibration ? `${state.calibration.sampleCount} 个采样点` : '暂无采样',
    selectedStrategyLabel: strategy.label,
    strategyOptions: STRATEGY_PRESETS.map((preset) => ({
      id: preset.id,
      label: preset.label,
      description: preset.description,
      selected: preset.id === state.strategyPreset
    })),
    runtimeIssueTitle: runtimeIssue.title,
    runtimeIssueGuidance: runtimeIssue.optionsGuidance,
    summary: buildStatsSummary(state.stats, todayDate)
  };
}
