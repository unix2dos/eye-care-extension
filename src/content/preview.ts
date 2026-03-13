import { DEFAULT_REMINDER_SPEECH } from './reminder/tts';

export const PREVIEW_REMINDER_MESSAGE = DEFAULT_REMINDER_SPEECH;
export const PREVIEW_REMINDER_VISIBLE_MS = 2_500;

export interface OverlayLike {
  show(message: string): void;
  hide(): void;
}

export interface PreviewReminderRunnerDeps {
  overlay: OverlayLike;
  speakReminder: (text: string) => Promise<void>;
  setTimeout: typeof window.setTimeout;
  clearTimeout: typeof window.clearTimeout;
  visibleMs?: number;
}

export function createPreviewReminderRunner({
  overlay,
  speakReminder,
  setTimeout,
  clearTimeout,
  visibleMs = PREVIEW_REMINDER_VISIBLE_MS
}: PreviewReminderRunnerDeps): () => Promise<void> {
  let hideTimer: number | null = null;

  return async () => {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
    }

    overlay.show(PREVIEW_REMINDER_MESSAGE);
    await speakReminder(PREVIEW_REMINDER_MESSAGE).catch(() => undefined);

    hideTimer = setTimeout(() => {
      overlay.hide();
      hideTimer = null;
    }, visibleMs);
  };
}
