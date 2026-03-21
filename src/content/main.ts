import { DEFAULT_POLICY, DEFAULT_REMINDER_SETTINGS } from '../shared/constants';
import { TOOLBAR_ICON_STATE_COMMAND } from '../shared/messages';
import { AppStorage, STORAGE_KEY } from '../shared/storage';
import type { ReminderSettings } from '../shared/types';
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
import { ReadingEngine } from './reading-engine';
import { installMessageBridge } from './message-bridge';

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

  let settings: ReminderSettings = persisted.settings ?? DEFAULT_REMINDER_SETTINGS;

  const reportToolbarIconState = async (isActiveReading: boolean): Promise<void> => {
    try {
      await chrome.runtime.sendMessage({
        type: TOOLBAR_ICON_STATE_COMMAND,
        isSupportedPage: true,
        isActiveReading
      });
    } catch {
      // The reading flow should keep working even if toolbar updates fail.
    }
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

  const engine = new ReadingEngine(
    {
      session,
      scheduler,
      storage,
      overlay,
      playReminder,
      recordReminderAudioDebug,
      reportToolbarIconState,
      getBookTitle: () => getWeReadBookTitle(doc),
      getReminderIntervalMs: () => getReminderIntervalMs(settings),
      getReminderPresentation: () => getReminderPresentation(settings),
      getReminderSpeech: () => DEFAULT_REMINDER_SPEECH,
      isAudioEnabled: () => settings.audioEnabled,
      doc
    },
    {
      stats: persisted.stats,
      activeReadingTimeMs: persisted.activeReadingTimeMs,
      isActiveReading: persisted.isActiveReading,
      nextEligibleReminderAt: persisted.nextEligibleReminderAt
    }
  );

  const applySettings = async (nextSettings: ReminderSettings): Promise<void> => {
    if (areSettingsEqual(settings, nextSettings)) {
      return;
    }
    settings = nextSettings;
    scheduler.setReminderIntervalMs(getReminderIntervalMs(settings));
    await engine.syncSchedule(Date.now());
  };

  const previewReminder = createPreviewReminderRunner({
    overlay,
    playReminder,
    getPresentation: () => getReminderPresentation(settings)
  });

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
      void engine.syncSchedule(Date.now());
    }
  });

  installMessageBridge({
    storage,
    engine,
    session,
    overlay,
    playReminder,
    applySettings,
    previewReminder,
    doc,
    inactivityTimeoutMs: DEFAULT_POLICY.inactivityTimeoutMs
  });

  markInteraction();
  await engine.syncSchedule(Date.now());
  await reportToolbarIconState(session.isActive(Date.now()));
  engine.start(win);
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
