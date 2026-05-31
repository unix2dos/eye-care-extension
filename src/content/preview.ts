import { DEFAULT_REMINDER_MESSAGE } from './reminder/copy';
import type { ReminderOverlayPresentation } from './reminder/overlay';

export const PREVIEW_REMINDER_MESSAGE = DEFAULT_REMINDER_MESSAGE;

export interface OverlayLike {
  show(
    message: string,
    mode: 'preview' | 'reminder',
    presentation?: ReminderOverlayPresentation,
    countdownSeconds?: number
  ): Promise<void>;
}

export interface PreviewReminderRunnerDeps {
  overlay: OverlayLike;
  playReminder: () => Promise<unknown>;
  getPresentation?: () => ReminderOverlayPresentation;
  getMessage?: () => string;
  getCountdownSeconds?: () => number | null;
}

export function createPreviewReminderRunner({
  overlay,
  playReminder,
  getPresentation = () => 'fullscreen',
  getMessage = () => PREVIEW_REMINDER_MESSAGE,
  getCountdownSeconds = () => null
}: PreviewReminderRunnerDeps): () => Promise<void> {
  return async () => {
    const dismissed = overlay.show(getMessage(), 'preview', getPresentation(), getCountdownSeconds() ?? undefined);
    await playReminder().catch(() => undefined);
    await dismissed;
  };
}
