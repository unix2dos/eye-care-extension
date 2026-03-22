import { describe, expect, it, vi } from 'vitest';

import { ActiveReadingReminderScheduler } from './runtime/scheduler';
import { ActiveReadingSession } from './activity/session';
import { ReadingEngine, type ReadingEngineDeps } from './reading-engine';
import { createEmptyStatsState } from '../shared/stats';

function createMockDeps(overrides: Partial<ReadingEngineDeps> = {}): ReadingEngineDeps {
  return {
    session: new ActiveReadingSession(180_000),
    scheduler: new ActiveReadingReminderScheduler(20 * 60_000),
    storage: {
      setRuntimeStatus: vi.fn().mockResolvedValue(undefined),
      saveStats: vi.fn().mockResolvedValue(undefined)
    },
    overlay: {
      show: vi.fn().mockResolvedValue(undefined),
      isBlockingReminderVisible: vi.fn().mockReturnValue(false)
    },
    playReminder: vi.fn().mockResolvedValue({
      sourceUrl: 'test.m4a',
      playbackKind: 'bundled-audio',
      status: 'played',
      errorMessage: null
    }),
    recordReminderAudioDebug: vi.fn(),
    reportToolbarIconState: vi.fn().mockResolvedValue(undefined),
    getDomain: () => 'weread.qq.com',
    getBookTitle: () => '测试书名',
    getReminderIntervalMs: () => 20 * 60_000,
    getReminderPresentation: () => 'fullscreen',
    getReminderSpeech: () => '请休息一下。',
    isAudioEnabled: () => true,
    doc: { visibilityState: 'visible' },
    ...overrides
  };
}

describe('ReadingEngine', () => {
  it('records stats and skips reminder when not yet due', async () => {
    const deps = createMockDeps();
    const session = deps.session as ActiveReadingSession;
    const now = 10 * 60_000;

    session.markInteraction(now - 1_000); // Recent interaction — session is active
    const engine = new ReadingEngine(deps, {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: false,
      nextEligibleReminderAt: null
    });

    // Pre-warm the scheduler so it knows about "active" state
    deps.scheduler.update(now - 1_000, true);

    await engine.tick(now);

    expect(deps.storage.saveStats).toHaveBeenCalled();
    expect(deps.overlay.show).not.toHaveBeenCalled();
  });

  it('triggers overlay and audio when reminder is due', async () => {
    const deps = createMockDeps();
    const session = deps.session as ActiveReadingSession;

    session.markInteraction(0);
    const engine = new ReadingEngine(deps, {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 19 * 60_000,
      isActiveReading: true,
      nextEligibleReminderAt: 20 * 60_000
    });

    // Pre-warm the scheduler with existing time
    const scheduler = new ActiveReadingReminderScheduler(20 * 60_000, 19 * 60_000);
    (deps as { scheduler: ActiveReadingReminderScheduler }).scheduler = scheduler;
    scheduler.update(0, true);

    // Advance by 2 minutes (should now be >= 20 min total)
    session.markInteraction(60_000);
    await engine.tick(2 * 60_000);

    expect(deps.overlay.show).toHaveBeenCalledWith('请休息一下。', 'reminder', 'fullscreen');
    expect(deps.playReminder).toHaveBeenCalled();
  });

  it('skips tick when overlay is blocking', async () => {
    const deps = createMockDeps({
      overlay: {
        show: vi.fn().mockResolvedValue(undefined),
        isBlockingReminderVisible: vi.fn().mockReturnValue(true)
      }
    });

    const engine = new ReadingEngine(deps, {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: true,
      nextEligibleReminderAt: null
    });

    await engine.tick(1_000);

    expect(deps.storage.saveStats).not.toHaveBeenCalled();
    expect(deps.overlay.show).not.toHaveBeenCalled();
  });

  it('skips stats recording when session is not active', async () => {
    const deps = createMockDeps();
    // Do NOT call session.markInteraction — session is inactive

    const engine = new ReadingEngine(deps, {
      stats: createEmptyStatsState(),
      activeReadingTimeMs: 0,
      isActiveReading: false,
      nextEligibleReminderAt: null
    });

    await engine.tick(1_000);

    expect(deps.storage.saveStats).not.toHaveBeenCalled();
  });
});
