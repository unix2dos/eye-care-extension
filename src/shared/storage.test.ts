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
      mode: 'fallback'
    };

    await storage.saveState(state);
    await storage.resetCalibration();

    const after = await storage.loadState();

    expect(after.calibration).toBeNull();
    expect(after.mode).toBe('vision');
    expect(after.stats.days['2026-03-13']?.readingTimeMs).toBe(120_000);
  });
});
