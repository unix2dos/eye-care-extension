import { describe, expect, it, vi } from 'vitest';

import { PREVIEW_REMINDER_MESSAGE, createPreviewReminderRunner } from './preview';

describe('createPreviewReminderRunner', () => {
  it('shows the real reminder copy and speaks the reminder text', async () => {
    const overlay = {
      show: vi.fn(),
      hide: vi.fn()
    };
    const speakReminder = vi.fn().mockResolvedValue(undefined);
    const timers: Array<() => void> = [];

    const previewReminder = createPreviewReminderRunner({
      overlay,
      speakReminder,
      setTimeout: ((handler: () => void) => {
        timers.push(handler);
        return timers.length;
      }) as typeof setTimeout,
      clearTimeout: vi.fn() as unknown as typeof clearTimeout
    });

    await previewReminder();

    expect(overlay.show).toHaveBeenCalledWith(PREVIEW_REMINDER_MESSAGE);
    expect(speakReminder).toHaveBeenCalledWith(PREVIEW_REMINDER_MESSAGE);
    expect(overlay.hide).not.toHaveBeenCalled();
  });

  it('auto-hides the preview after the timeout', async () => {
    const overlay = {
      show: vi.fn(),
      hide: vi.fn()
    };
    const timers: Array<() => void> = [];

    const previewReminder = createPreviewReminderRunner({
      overlay,
      speakReminder: vi.fn().mockResolvedValue(undefined),
      setTimeout: ((handler: () => void) => {
        timers.push(handler);
        return timers.length;
      }) as typeof setTimeout,
      clearTimeout: vi.fn() as unknown as typeof clearTimeout
    });

    await previewReminder();
    timers[0]?.();

    expect(overlay.hide).toHaveBeenCalledTimes(1);
  });
});
