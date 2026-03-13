import { DEFAULT_REMINDER_SPEECH } from './reminder/tts';

export const PREVIEW_REMINDER_MESSAGE = DEFAULT_REMINDER_SPEECH;

export interface OverlayLike {
  show(message: string, mode: 'preview' | 'reminder'): Promise<void>;
}

export interface PreviewReminderRunnerDeps {
  overlay: OverlayLike;
  speakReminder: (text: string) => Promise<unknown>;
}

export function createPreviewReminderRunner({
  overlay,
  speakReminder
}: PreviewReminderRunnerDeps): () => Promise<void> {
  return async () => {
    const dismissed = overlay.show(PREVIEW_REMINDER_MESSAGE, 'preview');
    await speakReminder(PREVIEW_REMINDER_MESSAGE).catch(() => undefined);
    await dismissed;
  };
}
