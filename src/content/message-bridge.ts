import { REQUEST_RUNTIME_STATUS_COMMAND } from '../shared/messages';
import { STORAGE_KEY } from '../shared/storage';
import type { ReminderSettings, RuntimeStatusSnapshot, SubscriptionPlan } from '../shared/types';
import type { ReminderOverlayPresentation } from './reminder/overlay';

export interface MessageBridgeDeps {
  storage: {
    loadState(): Promise<{ settings: ReminderSettings; plan: SubscriptionPlan }>;
  };
  engine: {
    syncSchedule(now: number): Promise<{
      activeReadingTimeMs: number;
      isActive: boolean;
      nextReminderAt: number | null;
    }>;
  };
  session: {
    isActive(now: number): boolean;
    isVisibleNow(): boolean;
    getLastInteractionAt(): number | null;
  };
  overlay: {
    isBlockingReminderVisible(): boolean;
    show(message: string, mode: 'preview' | 'reminder', presentation: ReminderOverlayPresentation): Promise<void>;
  };
  applyPersistedState: (settings: ReminderSettings, plan: SubscriptionPlan) => Promise<void>;
  previewReminder: () => Promise<void>;
  doc: Pick<Document, 'visibilityState'>;
  inactivityTimeoutMs: number;
}

export function installMessageBridge(deps: MessageBridgeDeps): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'preview-reminder') {
      void deps.previewReminder();
      return false;
    }

    if (message?.type === REQUEST_RUNTIME_STATUS_COMMAND) {
      void (async () => {
        const schedule = await deps.engine.syncSchedule(Date.now());
        const isReminderBlockingVisible = deps.overlay.isBlockingReminderVisible();
        const isDocumentVisible = deps.doc.visibilityState === 'visible' && deps.session.isVisibleNow();
        const isActiveReadingNow = !isReminderBlockingVisible && isDocumentVisible && schedule.isActive;

        const snapshot: RuntimeStatusSnapshot = {
          isSupportedPage: true,
          isDocumentVisible,
          isActiveReading: isActiveReadingNow,
          lastInteractionAt: deps.session.getLastInteractionAt(),
          activeReadingTimeMs: schedule.activeReadingTimeMs,
          nextEligibleReminderAt: isActiveReadingNow ? schedule.nextReminderAt : null,
          inactivityTimeoutMs: deps.inactivityTimeoutMs
        };

        sendResponse(snapshot);
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
      const latest = await deps.storage.loadState();
      await deps.applyPersistedState(latest.settings, latest.plan);
    })();
  });
}
