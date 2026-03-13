import { DEFAULT_POLICY } from '../shared/constants';
import { getPolicyForStrategy } from '../shared/strategy';
import { AppStorage, STORAGE_KEY } from '../shared/storage';
import { recordReadingSample, recordReminderRecovery, recordReminderTriggered } from '../shared/stats';
import type {
  CalibrationProfile,
  PersistedState,
  ReminderPolicyConfig,
  ReminderStrategyPreset,
  RuntimeMode,
  RuntimeIssueCode,
  StatsState
} from '../shared/types';
import { ActiveReadingSession } from './activity/session';
import { CalibrationTracker } from './vision/calibration';
import { EyeCareController, resolveRuntimeStartup } from './runtime/controller';
import { getRuntimeIssueCopy } from './runtime/issues';
import { playReminderTone } from './reminder/audio';
import { ReminderOverlay } from './reminder/overlay';
import { MediaPipeVisionService } from './vision/service';
import { getWeReadBookTitle, isSupportedWeReadUrl } from './weread/adapter';

const VISION_SAMPLE_INTERVAL_MS = 750;
const STATS_SAMPLE_INTERVAL_MS = 5_000;
const FALLBACK_REMINDER_VISIBLE_MS = 10_000;

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function runCalibration(
  overlay: ReminderOverlay,
  visionService: MediaPipeVisionService
): Promise<CalibrationProfile | null> {
  const tracker = new CalibrationTracker();
  const startedAt = Date.now();

  overlay.show('护眼校准中：自然阅读约 45 秒，保持正视屏幕。');

  while (Date.now() - startedAt < DEFAULT_POLICY.calibrationDurationMs) {
    const observation = await visionService.sample(Date.now());
    tracker.addObservation(observation.ear, observation.blinkDetected);
    await sleep(VISION_SAMPLE_INTERVAL_MS);
  }

  return tracker.build(Date.now() - startedAt);
}

async function bootstrap(doc: Document, win: Window): Promise<void> {
  const url = new URL(win.location.href);
  if (!isSupportedWeReadUrl(url)) {
    return;
  }

  const overlay = new ReminderOverlay(doc);
  const storage = new AppStorage();
  const persisted = await storage.loadState();
  let currentPolicy: ReminderPolicyConfig = getPolicyForStrategy(persisted.strategyPreset);
  const session = new ActiveReadingSession(currentPolicy.inactivityTimeoutMs);
  const controller = new EyeCareController(currentPolicy);

  let stats: StatsState = persisted.stats;
  let calibration = persisted.calibration;
  let mode: RuntimeMode = persisted.mode;
  let strategyPreset: ReminderStrategyPreset = persisted.strategyPreset;
  let lastRuntimeIssue: RuntimeIssueCode = persisted.lastRuntimeIssue;
  let nextEligibleReminderAt: number | null = persisted.nextEligibleReminderAt;
  let latestBlinkRate: number | null = null;
  let latestLowBlinkDetected = false;
  let fallbackDismissTimer: number | null = null;
  let visionService: MediaPipeVisionService | null = null;

  const markInteraction = () => {
    session.markInteraction(Date.now());
  };

  ['scroll', 'click', 'keydown', 'wheel'].forEach((eventName) => {
    win.addEventListener(eventName, markInteraction, { passive: true });
  });

  doc.addEventListener('visibilitychange', () => {
    session.setVisibility(doc.visibilityState === 'visible', Date.now());
  });

  markInteraction();

  async function persistStats(): Promise<void> {
    await storage.saveStats(stats);
  }

  async function persistRuntimeStatus(
    nextStatus: Partial<Pick<PersistedState, 'mode' | 'lastRuntimeIssue' | 'nextEligibleReminderAt'>>
  ): Promise<void> {
    const nextMode = nextStatus.mode ?? mode;
    const nextIssue = nextStatus.lastRuntimeIssue ?? lastRuntimeIssue;
    const nextReminderAt =
      nextStatus.nextEligibleReminderAt === undefined ? nextEligibleReminderAt : nextStatus.nextEligibleReminderAt;

    if (nextMode === mode && nextIssue === lastRuntimeIssue && nextReminderAt === nextEligibleReminderAt) {
      return;
    }

    mode = nextMode;
    lastRuntimeIssue = nextIssue;
    nextEligibleReminderAt = nextReminderAt;

    await storage.setRuntimeStatus({
      mode,
      lastRuntimeIssue,
      nextEligibleReminderAt
    });
  }

  async function syncNextEligibleReminder(now: number): Promise<void> {
    await persistRuntimeStatus({
      nextEligibleReminderAt: controller.getNextEligibleReminderAt(now)
    });
  }

  async function triggerReminder(message: string): Promise<void> {
    overlay.show(message);
    await playReminderTone().catch(() => undefined);
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }

    const stateChange = changes[STORAGE_KEY];
    if (!stateChange?.newValue || typeof stateChange.newValue !== 'object') {
      return;
    }

    const nextState = stateChange.newValue as PersistedState;
    if (nextState.strategyPreset === strategyPreset) {
      return;
    }

    strategyPreset = nextState.strategyPreset;
    currentPolicy = getPolicyForStrategy(strategyPreset);
    controller.setPolicy(currentPolicy);
    void syncNextEligibleReminder(Date.now());
  });

  if ('mediaDevices' in navigator && typeof navigator.mediaDevices.getUserMedia === 'function') {
    visionService = new MediaPipeVisionService();
    overlay.show(calibration ? '正在启动护眼监测…' : '正在请求摄像头并准备校准…');

    const startup = await resolveRuntimeStartup({
      start: async () => {
        await visionService?.start(calibration ?? null);
      }
    });

    await persistRuntimeStatus({
      mode: startup.mode,
      lastRuntimeIssue: startup.issue
    });

    if (startup.mode === 'vision' && visionService) {
      if (!calibration) {
        calibration = await runCalibration(overlay, visionService);
        if (calibration) {
          visionService.setBlinkThreshold(calibration.blinkThreshold);
          await storage.saveCalibration(calibration);
          await persistRuntimeStatus({
            mode: 'vision',
            lastRuntimeIssue: 'none'
          });
          overlay.show('校准完成，护眼监测已开启。');
        } else {
          await visionService.stop();
          visionService = null;
          calibration = null;
          await persistRuntimeStatus({
            mode: 'fallback',
            lastRuntimeIssue: 'calibration-failed'
          });
          overlay.show(getRuntimeIssueCopy('calibration-failed').overlayMessage);
        }
      } else {
        visionService.setBlinkThreshold(calibration.blinkThreshold);
        await persistRuntimeStatus({
          mode: 'vision',
          lastRuntimeIssue: 'none'
        });
        overlay.show('护眼监测已开启。');
      }
    } else {
      overlay.show(getRuntimeIssueCopy(startup.issue).overlayMessage);
    }
  } else {
    await persistRuntimeStatus({
      mode: 'fallback',
      lastRuntimeIssue: 'browser-unsupported'
    });
    overlay.show(getRuntimeIssueCopy('browser-unsupported').overlayMessage);
  }

  win.setTimeout(() => overlay.hide(), 2_000);

  win.setInterval(() => {
    const now = Date.now();
    if (!session.isActive(now)) {
      latestBlinkRate = null;
      latestLowBlinkDetected = false;
      controller.resetReadingState();
      controller.cancelReminder(now);
      void syncNextEligibleReminder(now);
      overlay.hide();
      return;
    }

    const bookTitle = getWeReadBookTitle(doc);
    recordReadingSample(stats, {
      date: getTodayDate(),
      bookTitle,
      readingTimeMs: STATS_SAMPLE_INTERVAL_MS,
      blinkRatePerMinute: mode === 'vision' ? latestBlinkRate : null,
      lowBlinkDurationMs: latestLowBlinkDetected ? STATS_SAMPLE_INTERVAL_MS : 0
    });

    void persistStats();
  }, STATS_SAMPLE_INTERVAL_MS);

  if (mode === 'vision' && visionService) {
    win.setInterval(() => {
      void (async () => {
        const now = Date.now();
        if (!session.isActive(now)) {
          latestBlinkRate = null;
          latestLowBlinkDetected = false;
          return;
        }

        const observation = await visionService!.sample(now);
        const result = controller.updateVision(observation, session.getActiveReadingSince(now), calibration?.blinkRatePerMinute ?? null);

        latestBlinkRate = result.blinkRatePerMinute;
        latestLowBlinkDetected = result.lowBlinkDetected;

        if (result.reminderTriggered) {
          recordReminderTriggered(stats, {
            date: getTodayDate(),
            bookTitle: getWeReadBookTitle(doc)
          });
          await persistStats();
          await triggerReminder('请连续眨眼 3 次，放松一下眼睛。');
        }

        if (result.reminderDismissed) {
          overlay.hide();
          await syncNextEligibleReminder(now);
          recordReminderRecovery(stats, {
            date: getTodayDate(),
            bookTitle: getWeReadBookTitle(doc),
            recoveryTimeMs: result.recoveryTimeMs ?? 0,
            recovered: true
          });
          await persistStats();
        }
      })();
    }, VISION_SAMPLE_INTERVAL_MS);
  } else {
    win.setInterval(() => {
      const now = Date.now();
      if (!session.isActive(now)) {
        return;
      }

      const result = controller.updateFallback(now, session.getActiveReadingSince(now));
      if (!result.reminderTriggered) {
        return;
      }

      recordReminderTriggered(stats, {
        date: getTodayDate(),
        bookTitle: getWeReadBookTitle(doc)
      });
      void persistStats();

      if (fallbackDismissTimer !== null) {
        win.clearTimeout(fallbackDismissTimer);
      }

      void triggerReminder('休息一下，眨眼或看远处 10 秒。');

      fallbackDismissTimer = win.setTimeout(() => {
        const dismissedAt = Date.now();
        overlay.hide();
        controller.dismissFallback(dismissedAt);
        void syncNextEligibleReminder(dismissedAt);
        recordReminderRecovery(stats, {
          date: getTodayDate(),
          bookTitle: getWeReadBookTitle(doc),
          recoveryTimeMs: 0,
          recovered: false
        });
        void persistStats();
      }, FALLBACK_REMINDER_VISIBLE_MS);
    }, 5_000);
  }
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
