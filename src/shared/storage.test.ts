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
      domain: 'weread.qq.com',
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

  it('preserves both mutations when setRuntimeStatus and saveStats are called concurrently', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-22',
      domain: 'weread.qq.com',
      bookTitle: '变量',
      readingTimeMs: 60_000
    });

    await storage.saveState({
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: false,
      nextEligibleReminderAt: null,
      settings: {
        reminderIntervalMinutes: 20,
        audioEnabled: true,
        fullscreenReminder: true
      }
    } as PersistedState);

    // Fire both concurrently — without a write queue the second write would overwrite the first.
    await Promise.all([
      storage.setRuntimeStatus({
        activeReadingTimeMs: 300_000,
        isActiveReading: true,
        nextEligibleReminderAt: 500_000
      }),
      storage.saveStats(stats)
    ]);

    const after = await storage.loadState();

    expect(after.activeReadingTimeMs).toBe(300_000);
    expect(after.isActiveReading).toBe(true);
    expect(after.nextEligibleReminderAt).toBe(500_000);
    expect(after.stats).toEqual(stats);
  });

  it('keeps legacy book stats while normalizing the schema version', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);

    await storageArea.set({
      'weread-eye-care-state': {
        stats: {
          days: {
            '2026-03-22': {
              date: '2026-03-22',
              readingTimeMs: 120_000,
              reminderCount: 1,
              books: {
                变量: {
                  title: '变量',
                  readingTimeMs: 120_000,
                  reminderCount: 1
                }
              }
            }
          }
        }
      }
    });

    const state = await storage.loadState();

    expect(state.stats).toEqual({
      schemaVersion: 2,
      days: {
        '2026-03-22': {
          date: '2026-03-22',
          readingTimeMs: 120_000,
          reminderCount: 1,
          books: {
            变量: {
              title: '变量',
              domain: null,
              readingTimeMs: 120_000,
              reminderCount: 1
            }
          },
          domains: {}
        }
      }
    });
  });
});
