import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_REMINDER_SPEECH, speakReminderText } from './tts';

describe('speakReminderText', () => {
  it('speaks the default reminder copy through speechSynthesis', async () => {
    const speak = vi.fn();
    const cancel = vi.fn();

    await speakReminderText(DEFAULT_REMINDER_SPEECH, {
      synthesis: {
        speak,
        cancel
      } as unknown as SpeechSynthesis,
      createUtterance: (text) => ({ text }) as SpeechSynthesisUtterance
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: DEFAULT_REMINDER_SPEECH
      })
    );
  });

  it('does not throw when speech synthesis is unavailable', async () => {
    await expect(
      speakReminderText(DEFAULT_REMINDER_SPEECH, {
        synthesis: null,
        createUtterance: (text) => ({ text }) as SpeechSynthesisUtterance
      })
    ).resolves.toBeUndefined();
  });
});
