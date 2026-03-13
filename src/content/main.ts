import { DEFAULT_POLICY } from '../shared/constants';
import { AppStorage } from '../shared/storage';
import { recordReadingSample, recordReminderRecovery, recordReminderTriggered } from '../shared/stats';
import type { CalibrationProfile, RuntimeMode, StatsState } from '../shared/types';
import { ActiveReadingSession } from './activity/session';
import { CalibrationTracker } from './vision/calibration';
import { EyeCareController, resolveRuntimeMode } from './runtime/controller';
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
  const session = new ActiveReadingSession(DEFAULT_POLICY.inactivityTimeoutMs);
  const controller = new EyeCareController(DEFAULT_POLICY);
  const storage = new AppStorage();
  const persisted = await storage.loadState();

  let stats: StatsState = persisted.stats;
  let calibration = persisted.calibration;
  let mode: RuntimeMode = persisted.mode;
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

  async function persistRuntimeMode(nextMode: RuntimeMode): Promise<void> {
    mode = nextMode;
    await storage.setMode(nextMode);
  }

  async function triggerReminder(message: string): Promise<void> {
    overlay.show(message);
    await playReminderTone().catch(() => undefined);
  }

  if ('mediaDevices' in navigator && typeof navigator.mediaDevices.getUserMedia === 'function') {
    visionService = new MediaPipeVisionService();
    overlay.show(calibration ? '正在启动护眼监测…' : '正在请求摄像头并准备校准…');

    const resolvedMode = await resolveRuntimeMode({
      start: async () => {
        await visionService?.start(calibration ?? null);
      }
    });

    await persistRuntimeMode(resolvedMode);

    if (resolvedMode === 'vision' && visionService) {
      if (!calibration) {
        calibration = await runCalibration(overlay, visionService);
        if (calibration) {
          visionService.setBlinkThreshold(calibration.blinkThreshold);
          await storage.saveCalibration(calibration);
          overlay.show('校准完成，护眼监测已开启。');
        } else {
          await visionService.stop();
          visionService = null;
          calibration = null;
          await persistRuntimeMode('fallback');
          overlay.show('校准失败，已切换为定时提醒模式。');
        }
      } else {
        visionService.setBlinkThreshold(calibration.blinkThreshold);
        overlay.show('护眼监测已开启。');
      }
    } else {
      overlay.show('摄像头不可用，已切换为定时提醒模式。');
    }
  } else {
    await persistRuntimeMode('fallback');
    overlay.show('当前浏览器不支持摄像头，已切换为定时提醒模式。');
  }

  win.setTimeout(() => overlay.hide(), 2_000);

  win.setInterval(() => {
    const now = Date.now();
    if (!session.isActive(now)) {
      latestBlinkRate = null;
      latestLowBlinkDetected = false;
      controller.resetReadingState();
      controller.cancelReminder(now);
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
        overlay.hide();
        controller.dismissFallback(Date.now());
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
