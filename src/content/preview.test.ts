import { describe, expect, it, vi } from 'vitest';

import { PREVIEW_REMINDER_MESSAGE, createPreviewReminderRunner } from './preview';

describe('createPreviewReminderRunner', () => {
  it('shows the real reminder copy, speaks it, and waits for manual dismissal', async () => {
    let resolveDismiss: (() => void) | null = null;
    const overlay = {
      show: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveDismiss = resolve;
          })
      )
    };
    const playReminder = vi.fn().mockResolvedValue(undefined);

    const previewReminder = createPreviewReminderRunner({
      overlay,
      playReminder
    });

    let completed = false;
    const pending = previewReminder().then(() => {
      completed = true;
    });

    await Promise.resolve();

    expect(overlay.show).toHaveBeenCalledWith(PREVIEW_REMINDER_MESSAGE, 'preview', 'fullscreen');
    expect(playReminder).toHaveBeenCalledTimes(1);
    expect(completed).toBe(false);

    const dismiss = resolveDismiss as unknown as () => void;
    dismiss();
    await pending;

    expect(completed).toBe(true);
  });

  it('uses the configured compact presentation for preview reminders', async () => {
    let resolveDismiss: (() => void) | null = null;
    const overlay = {
      show: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveDismiss = resolve;
          })
      )
    };
    const playReminder = vi.fn().mockResolvedValue(undefined);

    const previewReminder = createPreviewReminderRunner({
      overlay,
      playReminder,
      getPresentation: () => 'compact'
    });

    const pending = previewReminder();
    await Promise.resolve();

    expect(overlay.show).toHaveBeenCalledWith(PREVIEW_REMINDER_MESSAGE, 'preview', 'compact');

    const dismiss = resolveDismiss as unknown as () => void;
    dismiss();
    await pending;
  });
});
