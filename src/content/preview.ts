import { DEFAULT_REMINDER_SPEECH } from './reminder/tts';

export const PREVIEW_REMINDER_MESSAGE = DEFAULT_REMINDER_SPEECH;

export interface OverlayLike {
  show(message: string, mode: 'preview' | 'reminder'): Promise<void>;
}

export interface PreviewReminderRunnerDeps {
  overlay: OverlayLike;
  playReminder: () => Promise<unknown>;
}

export function createPreviewReminderRunner({
  overlay,
  playReminder
}: PreviewReminderRunnerDeps): () => Promise<void> {
  return async () => {
    const dismissed = overlay.show(PREVIEW_REMINDER_MESSAGE, 'preview');
    await playReminder().catch(() => undefined);
    await dismissed;
  };
}
