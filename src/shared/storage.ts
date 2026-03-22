import { DEFAULT_REMINDER_SETTINGS } from './constants';
import { createEmptyStatsState, normalizeStatsState, trimOldDays } from './stats';
import type { PersistedState, ReminderMode, ReminderSettings, StatsState, StorageAreaLike } from './types';

export const STORAGE_KEY = 'weread-eye-care-state';

function getDefaultState(): PersistedState {
  return {
    stats: createEmptyStatsState(),
    activeReadingTimeMs: 0,
    isActiveReading: false,
    nextEligibleReminderAt: null,
    settings: DEFAULT_REMINDER_SETTINGS
  };
}

function normalizeReminderMode(raw: Partial<ReminderSettings>): ReminderMode {
  if (raw.reminderMode === 'standard' || raw.reminderMode === 'twenty-twenty-twenty') {
    return raw.reminderMode;
  }

  const containsLegacySettingsFields =
    raw.reminderIntervalMinutes !== undefined || raw.audioEnabled !== undefined || raw.fullscreenReminder !== undefined;

  if (containsLegacySettingsFields) {
    return 'standard';
  }

  return DEFAULT_REMINDER_SETTINGS.reminderMode;
}

function normalizeSettings(stored: unknown): ReminderSettings {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_REMINDER_SETTINGS;
  }

  const raw = stored as Partial<ReminderSettings>;
  const reminderIntervalMinutes =
    raw.reminderIntervalMinutes === 15 || raw.reminderIntervalMinutes === 20 || raw.reminderIntervalMinutes === 30
      ? raw.reminderIntervalMinutes
      : DEFAULT_REMINDER_SETTINGS.reminderIntervalMinutes;

  return {
    reminderMode: normalizeReminderMode(raw),
    reminderIntervalMinutes,
    audioEnabled:
      typeof raw.audioEnabled === 'boolean' ? raw.audioEnabled : DEFAULT_REMINDER_SETTINGS.audioEnabled,
    fullscreenReminder:
      typeof raw.fullscreenReminder === 'boolean'
        ? raw.fullscreenReminder
        : DEFAULT_REMINDER_SETTINGS.fullscreenReminder
  };
}

function normalizeState(stored: unknown): PersistedState {
  if (!stored || typeof stored !== 'object') {
    return getDefaultState();
  }

  const raw = stored as Partial<PersistedState>;

  return {
    stats: trimOldDays(normalizeStatsState(raw.stats)),
    activeReadingTimeMs: typeof raw.activeReadingTimeMs === 'number' ? raw.activeReadingTimeMs : 0,
    isActiveReading: typeof raw.isActiveReading === 'boolean' ? raw.isActiveReading : false,
    nextEligibleReminderAt: typeof raw.nextEligibleReminderAt === 'number' ? raw.nextEligibleReminderAt : null,
    settings: normalizeSettings(raw.settings)
  };
}

export class AppStorage {
  private pendingWrite: Promise<void> = Promise.resolve();

  constructor(private readonly storageArea: StorageAreaLike = chrome.storage.local) {}

  async loadState(): Promise<PersistedState> {
    const data = await this.storageArea.get(STORAGE_KEY);
    return normalizeState(data[STORAGE_KEY]);
  }

  async saveState(state: PersistedState): Promise<void> {
    await this.storageArea.set({ [STORAGE_KEY]: state });
  }

  private mutate(fn: (state: PersistedState) => PersistedState): Promise<void> {
    const next = this.pendingWrite.then(async () => {
      const state = await this.loadState();
      await this.saveState(fn(state));
    });
    this.pendingWrite = next.catch(() => undefined);
    return next;
  }

  async loadStats(): Promise<StatsState> {
    const state = await this.loadState();
    return state.stats;
  }

  async saveStats(stats: StatsState): Promise<void> {
    return this.mutate((state) => ({ ...state, stats }));
  }

  async setRuntimeStatus(status: Partial<Pick<PersistedState, 'activeReadingTimeMs' | 'isActiveReading' | 'nextEligibleReminderAt'>>): Promise<void> {
    return this.mutate((state) => ({ ...state, ...status }));
  }

  async saveSettings(settings: ReminderSettings): Promise<void> {
    return this.mutate((state) => ({ ...state, settings }));
  }

  async resetState(): Promise<void> {
    return this.mutate(() => getDefaultState());
  }
}
