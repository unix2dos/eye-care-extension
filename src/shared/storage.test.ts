import { AppStorage } from './storage';
import { createEmptyStatsState, recordReadingSample } from './stats';
import type { PersistedState, StorageAreaLike } from './types';

class MemoryStorageArea implements StorageAreaLike {
  private value: Record<string, unknown> = {};

  async get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>> {
    if (typeof keys === 'string') {
      return { [keys]: this.value[keys] };
    }

    return { ...this.value };
  }

  async set(items: Record<string, unknown>): Promise<void> {
    this.value = { ...this.value, ...items };
  }
}

describe('AppStorage', () => {
  it('updates runtime reminder status without touching accumulated stats', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-13',
      bookTitle: '变量',
      readingTimeMs: 120_000
    });

    const state = {
      stats,
      activeReadingTimeMs: 120_000,
      isActiveReading: false,
      nextEligibleReminderAt: null
    } as PersistedState;

    await storage.saveState(state);
    await storage.setRuntimeStatus({
      activeReadingTimeMs: 240_000,
      isActiveReading: true,
      nextEligibleReminderAt: 208_000
    });

    const after = await storage.loadState();

    expect(after).toEqual({
      stats,
      activeReadingTimeMs: 240_000,
      isActiveReading: true,
      nextEligibleReminderAt: 208_000,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      }
    });
  });

  it('fills in defaults for active reading runtime fields when loading older stored records', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);

    await storageArea.set({
      'weread-eye-care-state': {
        stats: createEmptyStatsState()
      }
    });

    const state = await storage.loadState();

    expect(state).toEqual({
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: false,
      nextEligibleReminderAt: null,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      }
    });
  });

  it('updates reminder settings without losing runtime state or stats', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);
    const state = {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 180_000,
      isActiveReading: true,
      nextEligibleReminderAt: 999_000,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      }
    } as PersistedState;

    await storage.saveState(state);
    await storage.saveSettings({
      reminderIntervalMinutes: 30,
      audioEnabled: false,
      fullscreenReminder: false
    });

    await expect(storage.loadState()).resolves.toEqual({
      ...state,
      settings: {
        reminderIntervalMinutes: 30,
        audioEnabled: false,
        fullscreenReminder: false
      }
    });
  });
});
