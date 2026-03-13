import { DEFAULT_POLICY } from '../shared/constants';
import { AppStorage } from '../shared/storage';
import { recordReadingSample, recordReminderTriggered } from '../shared/stats';
import type { PersistedState, StatsState } from '../shared/types';
import { ActiveReadingSession } from './activity/session';
import { createPreviewReminderRunner } from './preview';
import { ReminderOverlay } from './reminder/overlay';
import { DEFAULT_REMINDER_SPEECH, speakReminderText } from './reminder/tts';
import { ActiveReadingReminderScheduler } from './runtime/scheduler';
import { getWeReadBookTitle, isSupportedWeReadUrl } from './weread/adapter';

const STATS_SAMPLE_INTERVAL_MS = 5_000;
const REMINDER_VISIBLE_MS = 10_000;

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
    DEFAULT_POLICY.reminderIntervalMs,
    persisted.activeReadingTimeMs
  );

  let stats: StatsState = persisted.stats;
  let nextEligibleReminderAt: number | null = persisted.nextEligibleReminderAt;
  let activeReadingTimeMs = persisted.activeReadingTimeMs;
  let isActiveReading = persisted.isActiveReading;
  let reminderDismissTimer: number | null = null;

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

    activeReadingTimeMs = nextActiveReadingTimeMs;
    isActiveReading = nextIsActiveReading;
    nextEligibleReminderAt = nextReminderAt;

    await storage.setRuntimeStatus({
      activeReadingTimeMs,
      isActiveReading,
      nextEligibleReminderAt
    });
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

  const hideReminderLater = () => {
    if (reminderDismissTimer !== null) {
      win.clearTimeout(reminderDismissTimer);
    }

    reminderDismissTimer = win.setTimeout(() => {
      overlay.hide();
      reminderDismissTimer = null;
    }, REMINDER_VISIBLE_MS);
  };

  const triggerReminder = async () => {
    overlay.show(DEFAULT_REMINDER_SPEECH);
    await speakReminderText(DEFAULT_REMINDER_SPEECH).catch(() => undefined);
    hideReminderLater();
  };

  const markInteraction = () => {
    session.markInteraction(Date.now());
  };

  ['scroll', 'click', 'keydown', 'wheel'].forEach((eventName) => {
    win.addEventListener(eventName, markInteraction, { passive: true });
  });

  doc.addEventListener('visibilitychange', () => {
    session.setVisibility(doc.visibilityState === 'visible', Date.now());
    if (doc.visibilityState !== 'visible') {
      overlay.hide();
      void persistRuntimeStatus({
        isActiveReading: false,
        nextEligibleReminderAt: null
      });
    }
  });

  const previewReminder = createPreviewReminderRunner({
    overlay,
    speakReminder: speakReminderText,
    setTimeout: win.setTimeout.bind(win),
    clearTimeout: win.clearTimeout.bind(win)
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'preview-reminder') {
      return false;
    }

    void previewReminder();
    return false;
  });

  markInteraction();
  await persistRuntimeStatus({
    activeReadingTimeMs,
    isActiveReading,
    nextEligibleReminderAt
  });

  win.setInterval(() => {
    void (async () => {
      const now = Date.now();
      const schedule = await syncSchedule(now);

      if (!schedule.isActive) {
        overlay.hide();
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
        nextEligibleReminderAt: now + DEFAULT_POLICY.reminderIntervalMs
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
