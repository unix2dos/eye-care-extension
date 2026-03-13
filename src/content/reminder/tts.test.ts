import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_REMINDER_SPEECH, speakReminderText } from './tts';

describe('speakReminderText', () => {
  it('speaks the default reminder copy through speechSynthesis', async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    const voices = [
      {
        name: 'English',
        lang: 'en-US',
        default: true,
        localService: true
      },
      {
        name: '普通话',
        lang: 'zh-CN',
        default: false,
        localService: true
      }
    ] as SpeechSynthesisVoice[];

    await speakReminderText(DEFAULT_REMINDER_SPEECH, {
      synthesis: {
        speak,
        cancel,
        getVoices: () => voices
      } as unknown as SpeechSynthesis,
      createUtterance: (text) => ({ text }) as SpeechSynthesisUtterance
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: DEFAULT_REMINDER_SPEECH,
        lang: 'zh-CN',
        voice: voices[1]
      })
    );
  });

  it('prefers a mainland mandarin voice over other chinese voices', async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    const voices = [
      {
        name: 'Sin-ji',
        lang: 'zh-HK',
        default: true,
        localService: true
      },
      {
        name: 'Tingting',
        lang: 'zh-CN',
        default: false,
        localService: true
      }
    ] as SpeechSynthesisVoice[];

    await speakReminderText(DEFAULT_REMINDER_SPEECH, {
      synthesis: {
        speak,
        cancel,
        getVoices: () => voices
      } as unknown as SpeechSynthesis,
      createUtterance: (text) => ({ text }) as SpeechSynthesisUtterance
    });

    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({
        voice: voices[1]
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
