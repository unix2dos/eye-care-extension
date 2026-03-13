import { createEmptyStatsState } from './stats';
import type {
  CalibrationProfile,
  PersistedState,
  ReminderStrategyPreset,
  RuntimeMode,
  StatsState,
  StorageAreaLike
} from './types';

export const STORAGE_KEY = 'weread-eye-care-state';

function getDefaultState(): PersistedState {
  return {
    calibration: null,
    stats: createEmptyStatsState(),
    mode: 'vision',
    strategyPreset: 'standard',
    lastRuntimeIssue: 'none',
    nextEligibleReminderAt: null
  };
}

export class AppStorage {
  constructor(private readonly storageArea: StorageAreaLike = chrome.storage.local) {}

  async loadState(): Promise<PersistedState> {
    const data = await this.storageArea.get(STORAGE_KEY);
    const stored = data[STORAGE_KEY];
    if (!stored || typeof stored !== 'object') {
      return getDefaultState();
    }

    return {
      ...getDefaultState(),
      ...(stored as PersistedState)
    };
  }

  async saveState(state: PersistedState): Promise<void> {
    await this.storageArea.set({ [STORAGE_KEY]: state });
  }

  async loadStats(): Promise<StatsState> {
    const state = await this.loadState();
    return state.stats;
  }

  async saveStats(stats: StatsState): Promise<void> {
    const state = await this.loadState();
    await this.saveState({ ...state, stats });
  }

  async loadCalibration(): Promise<CalibrationProfile | null> {
    const state = await this.loadState();
    return state.calibration;
  }

  async saveCalibration(calibration: CalibrationProfile | null): Promise<void> {
    const state = await this.loadState();
    await this.saveState({ ...state, calibration });
  }

  async setMode(mode: RuntimeMode): Promise<void> {
    const state = await this.loadState();
    await this.saveState({ ...state, mode });
  }

  async setStrategyPreset(strategyPreset: ReminderStrategyPreset): Promise<void> {
    const state = await this.loadState();
    await this.saveState({ ...state, strategyPreset });
  }

  async setRuntimeStatus(
    status: Pick<PersistedState, 'mode' | 'lastRuntimeIssue' | 'nextEligibleReminderAt'>
  ): Promise<void> {
    const state = await this.loadState();
    await this.saveState({ ...state, ...status });
  }

  async resetCalibration(): Promise<void> {
    const state = await this.loadState();
    await this.saveState({
      ...state,
      calibration: null,
      mode: 'vision'
    });
  }

  async resetState(): Promise<void> {
    await this.saveState(getDefaultState());
  }
}
