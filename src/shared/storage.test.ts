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
  it('resets calibration without clearing accumulated stats', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-13',
      bookTitle: '变量',
      readingTimeMs: 120_000,
      blinkRatePerMinute: 18,
      lowBlinkDurationMs: 30_000
    });

    const state: PersistedState = {
      calibration: {
        blinkRatePerMinute: 18,
        blinkThreshold: 0.24,
        averageOpenEar: 0.32,
        calibratedAt: '2026-03-13T00:00:00.000Z',
        sampleCount: 120
      },
      stats,
      mode: 'fallback',
      strategyPreset: 'sensitive',
      lastRuntimeIssue: 'device-unavailable',
      nextEligibleReminderAt: 208_000
    };

    await storage.saveState(state);
    await storage.resetCalibration();

    const after = await storage.loadState();

    expect(after.calibration).toBeNull();
    expect(after.mode).toBe('vision');
    expect(after.strategyPreset).toBe('sensitive');
    expect(after.lastRuntimeIssue).toBe('device-unavailable');
    expect(after.nextEligibleReminderAt).toBe(208_000);
    expect(after.stats.days['2026-03-13']?.readingTimeMs).toBe(120_000);
  });

  it('fills in defaults for strategy and runtime issue when loading older stored records', async () => {
    const storageArea = new MemoryStorageArea();
    const storage = new AppStorage(storageArea);

    await storageArea.set({
      'weread-eye-care-state': {
        calibration: null,
        stats: createEmptyStatsState(),
        mode: 'vision'
      }
    });

    const state = await storage.loadState();

    expect(state.strategyPreset).toBe('standard');
    expect(state.lastRuntimeIssue).toBe('none');
    expect(state.nextEligibleReminderAt).toBeNull();
  });
});
