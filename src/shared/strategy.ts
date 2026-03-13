import { DEFAULT_POLICY } from './constants';
import type { ReminderPolicyConfig, ReminderStrategyPreset } from './types';

export interface ReminderStrategyMeta {
  id: ReminderStrategyPreset;
  label: string;
  description: string;
}

export const STRATEGY_PRESETS: ReminderStrategyMeta[] = [
  {
    id: 'conservative',
    label: '保守',
    description: '更少打扰，提醒更晚'
  },
  {
    id: 'standard',
    label: '标准',
    description: '平衡提醒频率和准确性'
  },
  {
    id: 'sensitive',
    label: '敏感',
    description: '更早提醒，更容易触发'
  }
];

const STRATEGY_POLICY_MAP: Record<ReminderStrategyPreset, ReminderPolicyConfig> = {
  conservative: {
    ...DEFAULT_POLICY,
    focusThresholdMs: 30_000,
    lowBlinkRatio: 0.5,
    reminderCooldownMs: 5 * 60_000,
    fallbackReminderIntervalMs: 30 * 60_000
  },
  standard: DEFAULT_POLICY,
  sensitive: {
    ...DEFAULT_POLICY,
    focusThresholdMs: 15_000,
    lowBlinkRatio: 0.75,
    reminderCooldownMs: 2 * 60_000,
    fallbackReminderIntervalMs: 15 * 60_000
  }
};

export function getPolicyForStrategy(strategy: ReminderStrategyPreset): ReminderPolicyConfig {
  return STRATEGY_POLICY_MAP[strategy];
}

export function getStrategyMeta(strategy: ReminderStrategyPreset): ReminderStrategyMeta {
  return STRATEGY_PRESETS.find((preset) => preset.id === strategy) ?? STRATEGY_PRESETS[1];
}
