import { DEFAULT_POLICY, DEFAULT_REMINDER_SETTINGS } from '../shared/constants';
import { TOOLBAR_ICON_STATE_COMMAND } from '../shared/messages';
import { canUseBreakGuideAnimation, sanitizeReminderSettingsForPlan } from '../shared/plan';
import { getEffectiveReminderIntervalMinutes, getReminderCountdownSeconds } from '../shared/reminder-mode';
import { AppStorage } from '../shared/storage';
import type { ReminderSettings, SubscriptionPlan } from '../shared/types';
import { ActiveReadingSession } from './activity/session';
import { createPreviewReminderRunner } from './preview';
import {
  createDisabledReminderAudioDebugInfo,
  createReminderAudioPlayer,
  type ReminderAudioDebugInfo
} from './reminder/audio';
import { DEFAULT_REMINDER_MESSAGE, TWENTY_TWENTY_TWENTY_REMINDER_MESSAGE } from './reminder/copy';
import { ReminderOverlay, type ReminderOverlayPresentation } from './reminder/overlay';
import { ActiveReadingReminderScheduler } from './runtime/scheduler';
import { getWeReadBookTitle, isSupportedWeReadUrl } from './weread/adapter';
import { ReadingEngine } from './reading-engine';
import { installMessageBridge } from './message-bridge';

function getReminderIntervalMs(settings: ReminderSettings): number {
  return getEffectiveReminderIntervalMinutes(settings) * 60_000;
}

function getReminderPresentation(settings: ReminderSettings): ReminderOverlayPresentation {
  return settings.fullscreenReminder ? 'fullscreen' : 'compact';
}

function getReminderMessage(settings: ReminderSettings): string {
  return settings.reminderMode === 'twenty-twenty-twenty'
    ? TWENTY_TWENTY_TWENTY_REMINDER_MESSAGE
    : DEFAULT_REMINDER_MESSAGE;
}

function areSettingsEqual(left: ReminderSettings, right: ReminderSettings): boolean {
  return (
    left.reminderMode === right.reminderMode &&
    left.reminderIntervalMinutes === right.reminderIntervalMinutes &&
    left.audioEnabled === right.audioEnabled &&
    left.fullscreenReminder === right.fullscreenReminder
  );
}

async function bootstrap(doc: Document, win: Window): Promise<void> {
  if (doc.documentElement.dataset.wereadEyeCareBootMarker === 'booted') {
    return;
  }

  doc.documentElement.dataset.wereadEyeCareBootMarker = 'booted';

  const url = new URL(win.location.href);
  const isWeReadPage = isSupportedWeReadUrl(url);
  const domain = url.hostname || null;

  const storage = new AppStorage();
  const persisted = await storage.loadState();
  let plan: SubscriptionPlan = persisted.plan;
  const overlay = new ReminderOverlay(doc, {
    supportsGuideAnimation: () => canUseBreakGuideAnimation(plan)
  });
  const session = new ActiveReadingSession(DEFAULT_POLICY.inactivityTimeoutMs);
  const scheduler = new ActiveReadingReminderScheduler(
    getReminderIntervalMs(sanitizeReminderSettingsForPlan(persisted.settings, plan)),
    persisted.activeReadingTimeMs
  );
  const playReminderAudio = createReminderAudioPlayer();

  let settings: ReminderSettings = sanitizeReminderSettingsForPlan(
    persisted.settings ?? DEFAULT_REMINDER_SETTINGS,
    plan
  );

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
      getDomain: () => domain,
      getBookTitle: () => (isWeReadPage ? getWeReadBookTitle(doc) : null),
      getReminderIntervalMs: () => getReminderIntervalMs(settings),
      getReminderPresentation: () => getReminderPresentation(settings),
      getReminderMessage: () => getReminderMessage(settings),
      getReminderCountdownSeconds: () => getReminderCountdownSeconds(settings),
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

  const applyPersistedState = async (nextSettings: ReminderSettings, nextPlan: SubscriptionPlan): Promise<void> => {
    plan = nextPlan;
    const normalizedSettings = sanitizeReminderSettingsForPlan(nextSettings, plan);

    if (areSettingsEqual(settings, normalizedSettings)) {
      return;
    }
    settings = normalizedSettings;
    scheduler.setReminderIntervalMs(getReminderIntervalMs(settings));
    await engine.syncSchedule(Date.now());
  };

  const previewReminder = createPreviewReminderRunner({
    overlay,
    playReminder,
    getPresentation: () => getReminderPresentation(settings),
    getMessage: () => getReminderMessage(settings),
    getCountdownSeconds: () => getReminderCountdownSeconds(settings)
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
    applyPersistedState,
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
