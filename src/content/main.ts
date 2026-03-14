import { DEFAULT_POLICY, DEFAULT_REMINDER_SETTINGS } from '../shared/constants';
import { REQUEST_RUNTIME_STATUS_COMMAND, TOOLBAR_ICON_STATE_COMMAND } from '../shared/messages';
import { AppStorage, STORAGE_KEY } from '../shared/storage';
import { recordReadingSample, recordReminderTriggered } from '../shared/stats';
import type { PersistedState, ReminderSettings, RuntimeStatusSnapshot, StatsState } from '../shared/types';
import { ActiveReadingSession } from './activity/session';
import { createPreviewReminderRunner } from './preview';
import {
  createDisabledReminderAudioDebugInfo,
  createReminderAudioPlayer,
  type ReminderAudioDebugInfo
} from './reminder/audio';
import { ReminderOverlay, type ReminderOverlayPresentation } from './reminder/overlay';
import { DEFAULT_REMINDER_SPEECH } from './reminder/tts';
import { ActiveReadingReminderScheduler } from './runtime/scheduler';
import { getWeReadBookTitle, isSupportedWeReadUrl } from './weread/adapter';

const STATS_SAMPLE_INTERVAL_MS = 5_000;

function getReminderIntervalMs(settings: ReminderSettings): number {
  return settings.reminderIntervalMinutes * 60_000;
}

function getReminderPresentation(settings: ReminderSettings): ReminderOverlayPresentation {
  return settings.fullscreenReminder ? 'fullscreen' : 'compact';
}

function areSettingsEqual(left: ReminderSettings, right: ReminderSettings): boolean {
  return (
    left.reminderIntervalMinutes === right.reminderIntervalMinutes &&
    left.audioEnabled === right.audioEnabled &&
    left.fullscreenReminder === right.fullscreenReminder
  );
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function bootstrap(doc: Document, win: Window): Promise<void> {
  doc.documentElement.dataset.wereadEyeCareBootMarker = 'booted';

  const url = new URL(win.location.href);
  if (!isSupportedWeReadUrl(url)) {
    return;
  }

  const overlay = new ReminderOverlay(doc);
  const storage = new AppStorage();
  const persisted = await storage.loadState();
  const session = new ActiveReadingSession(DEFAULT_POLICY.inactivityTimeoutMs);
  const scheduler = new ActiveReadingReminderScheduler(
    getReminderIntervalMs(persisted.settings),
    persisted.activeReadingTimeMs
  );
  const playReminderAudio = createReminderAudioPlayer();

  let stats: StatsState = persisted.stats;
  let nextEligibleReminderAt: number | null = persisted.nextEligibleReminderAt;
  let activeReadingTimeMs = persisted.activeReadingTimeMs;
  let isActiveReading = persisted.isActiveReading;
  let settings: ReminderSettings = persisted.settings ?? DEFAULT_REMINDER_SETTINGS;

  const reportToolbarIconState = async (nextIsActiveReading: boolean): Promise<void> => {
    try {
      await chrome.runtime.sendMessage({
        type: TOOLBAR_ICON_STATE_COMMAND,
        isSupportedPage: true,
        isActiveReading: nextIsActiveReading
      });
    } catch {
      // The reading flow should keep working even if toolbar updates fail.
    }
  };

  const persistRuntimeStatus = async (
    nextStatus: Partial<Pick<PersistedState, 'activeReadingTimeMs' | 'isActiveReading' | 'nextEligibleReminderAt'>>
  ): Promise<void> => {
    const nextActiveReadingTimeMs = nextStatus.activeReadingTimeMs ?? activeReadingTimeMs;
    const nextIsActiveReading = nextStatus.isActiveReading ?? isActiveReading;
    const nextReminderAt =
      nextStatus.nextEligibleReminderAt === undefined ? nextEligibleReminderAt : nextStatus.nextEligibleReminderAt;

    if (
      nextActiveReadingTimeMs === activeReadingTimeMs &&
      nextIsActiveReading === isActiveReading &&
      nextReminderAt === nextEligibleReminderAt
    ) {
      return;
    }

    const shouldReportToolbarState = nextIsActiveReading !== isActiveReading;

    activeReadingTimeMs = nextActiveReadingTimeMs;
    isActiveReading = nextIsActiveReading;
    nextEligibleReminderAt = nextReminderAt;

    await storage.setRuntimeStatus({
      activeReadingTimeMs,
      isActiveReading,
      nextEligibleReminderAt
    });

    if (shouldReportToolbarState) {
      await reportToolbarIconState(isActiveReading);
    }
  };

  const persistStats = async (): Promise<void> => {
    await storage.saveStats(stats);
  };

  const syncSchedule = async (now: number): Promise<ReturnType<ActiveReadingReminderScheduler['update']>> => {
    const schedule = scheduler.update(now, session.isActive(now));
    await persistRuntimeStatus({
      activeReadingTimeMs: schedule.activeReadingTimeMs,
      isActiveReading: schedule.isActive,
      nextEligibleReminderAt: schedule.isActive ? schedule.nextReminderAt : null
    });
    return schedule;
  };

  const recordReminderAudioDebug = (debugInfo: ReminderAudioDebugInfo) => {
    doc.documentElement.dataset.wereadEyeCareReminderAudioPath = debugInfo.sourceUrl;
    doc.documentElement.dataset.wereadEyeCareReminderAudioStatus = debugInfo.status;
    doc.documentElement.dataset.wereadEyeCareReminderAudioErrorMessage = debugInfo.errorMessage ?? '';
  };

  const playReminder = async () => {
    const debugInfo = settings.audioEnabled ? await playReminderAudio() : createDisabledReminderAudioDebugInfo();
    recordReminderAudioDebug(debugInfo);
    return debugInfo;
  };

  const triggerReminder = async () => {
    const dismissed = overlay.show(DEFAULT_REMINDER_SPEECH, 'reminder', getReminderPresentation(settings));
    await playReminder();
    await dismissed;
  };

  const getRuntimeStatusSnapshot = async (now: number): Promise<RuntimeStatusSnapshot> => {
    const schedule = await syncSchedule(now);
    const isReminderBlockingVisible = overlay.isBlockingReminderVisible();
    const isDocumentVisible = doc.visibilityState === 'visible' && session.isVisibleNow();
    const isActiveReadingNow = !isReminderBlockingVisible && isDocumentVisible && schedule.isActive;

    return {
      isSupportedPage: true,
      isDocumentVisible,
      isActiveReading: isActiveReadingNow,
      lastInteractionAt: session.getLastInteractionAt(),
      activeReadingTimeMs: schedule.activeReadingTimeMs,
      nextEligibleReminderAt: isActiveReadingNow ? schedule.nextReminderAt : null,
      inactivityTimeoutMs: DEFAULT_POLICY.inactivityTimeoutMs
    };
  };

  const applySettings = async (nextSettings: ReminderSettings): Promise<void> => {
    if (areSettingsEqual(settings, nextSettings)) {
      return;
    }

    settings = nextSettings;
    scheduler.setReminderIntervalMs(getReminderIntervalMs(settings));
    await syncSchedule(Date.now());
  };

  const markInteraction = () => {
    session.markInteraction(Date.now());
    void reportToolbarIconState(session.isActive(Date.now()));
  };

  ['scroll', 'click', 'keydown', 'wheel'].forEach((eventName) => {
    win.addEventListener(eventName, markInteraction, { passive: true });
  });

  doc.addEventListener('visibilitychange', () => {
    session.setVisibility(doc.visibilityState === 'visible', Date.now());
    void reportToolbarIconState(session.isActive(Date.now()));
    if (doc.visibilityState !== 'visible') {
      void persistRuntimeStatus({
        isActiveReading: false,
        nextEligibleReminderAt: null
      });
    }
  });

  const previewReminder = createPreviewReminderRunner({
    overlay,
    playReminder,
    getPresentation: () => getReminderPresentation(settings)
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'preview-reminder') {
      void previewReminder();
      return false;
    }

    if (message?.type === REQUEST_RUNTIME_STATUS_COMMAND) {
      void (async () => {
        sendResponse(await getRuntimeStatusSnapshot(Date.now()));
      })();
      return true;
    }

    return false;
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) {
      return;
    }

    void (async () => {
      const latest = await storage.loadState();
      await applySettings(latest.settings);
    })();
  });

  markInteraction();
  await syncSchedule(Date.now());
  await reportToolbarIconState(session.isActive(Date.now()));

  win.setInterval(() => {
    void (async () => {
      const now = Date.now();
      if (overlay.isBlockingReminderVisible()) {
        await persistRuntimeStatus({
          isActiveReading: false,
          nextEligibleReminderAt: null
        });
        return;
      }

      const schedule = await syncSchedule(now);

      if (!schedule.isActive) {
        return;
      }

      recordReadingSample(stats, {
        date: getTodayDate(),
        bookTitle: getWeReadBookTitle(doc),
        readingTimeMs: STATS_SAMPLE_INTERVAL_MS
      });
      await persistStats();

      if (!schedule.reminderDue) {
        return;
      }

      recordReminderTriggered(stats, {
        date: getTodayDate(),
        bookTitle: getWeReadBookTitle(doc)
      });
      await persistStats();

      scheduler.markReminderTriggered(now);
      await persistRuntimeStatus({
        activeReadingTimeMs: 0,
        isActiveReading: true,
        nextEligibleReminderAt: now + getReminderIntervalMs(settings)
      });

      await triggerReminder();
    })();
  }, STATS_SAMPLE_INTERVAL_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      void bootstrap(document, window);
    },
    { once: true }
  );
} else {
  void bootstrap(document, window);
}
