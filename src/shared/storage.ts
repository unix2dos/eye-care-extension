import { createEmptyStatsState, normalizeStatsState } from './stats';
import type { PersistedState, StatsState, StorageAreaLike } from './types';

export const STORAGE_KEY = 'weread-eye-care-state';

function getDefaultState(): PersistedState {
  return {
    stats: createEmptyStatsState(),
    activeReadingTimeMs: 0,
    isActiveReading: false,
    nextEligibleReminderAt: null
  };
}

function normalizeState(stored: unknown): PersistedState {
  if (!stored || typeof stored !== 'object') {
    return getDefaultState();
  }

  const raw = stored as Partial<PersistedState>;

  return {
    stats: normalizeStatsState(raw.stats),
    activeReadingTimeMs: typeof raw.activeReadingTimeMs === 'number' ? raw.activeReadingTimeMs : 0,
    isActiveReading: typeof raw.isActiveReading === 'boolean' ? raw.isActiveReading : false,
    nextEligibleReminderAt: typeof raw.nextEligibleReminderAt === 'number' ? raw.nextEligibleReminderAt : null
  };
}

export class AppStorage {
  constructor(private readonly storageArea: StorageAreaLike = chrome.storage.local) {}

  async loadState(): Promise<PersistedState> {
    const data = await this.storageArea.get(STORAGE_KEY);
    return normalizeState(data[STORAGE_KEY]);
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

  async setRuntimeStatus(status: Partial<Pick<PersistedState, 'activeReadingTimeMs' | 'isActiveReading' | 'nextEligibleReminderAt'>>): Promise<void> {
    const state = await this.loadState();
    await this.saveState({ ...state, ...status });
  }

  async resetState(): Promise<void> {
    await this.saveState(getDefaultState());
  }
}
