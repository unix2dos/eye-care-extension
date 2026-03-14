import { DEFAULT_REMINDER_SPEECH } from './reminder/tts';
import type { ReminderOverlayPresentation } from './reminder/overlay';

export const PREVIEW_REMINDER_MESSAGE = DEFAULT_REMINDER_SPEECH;

export interface OverlayLike {
  show(message: string, mode: 'preview' | 'reminder', presentation?: ReminderOverlayPresentation): Promise<void>;
}

export interface PreviewReminderRunnerDeps {
  overlay: OverlayLike;
  playReminder: () => Promise<unknown>;
  getPresentation?: () => ReminderOverlayPresentation;
}

export function createPreviewReminderRunner({
  overlay,
  playReminder,
  getPresentation = () => 'fullscreen'
}: PreviewReminderRunnerDeps): () => Promise<void> {
  return async () => {
    const dismissed = overlay.show(PREVIEW_REMINDER_MESSAGE, 'preview', getPresentation());
    await playReminder().catch(() => undefined);
    await dismissed;
  };
}
