import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_REMINDER_AUDIO_PATH, createReminderAudioPlayer } from './audio';

describe('createReminderAudioPlayer', () => {
  it('replays the bundled reminder audio from the start each time', async () => {
    const pause = vi.fn();
    const play = vi.fn().mockResolvedValue(undefined);
    const audio = {
      currentTime: 9,
      pause,
      play
    };

    const playReminder = createReminderAudioPlayer({
      getAssetUrl: (path) => `chrome-extension://test/${path}`,
      createAudio: (src) => {
        expect(src).toBe(`chrome-extension://test/${DEFAULT_REMINDER_AUDIO_PATH}`);
        return audio as unknown as HTMLAudioElement;
      }
    });

    const debug = await playReminder();

    expect(pause).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(1);
    expect(debug).toEqual({
      sourceUrl: `chrome-extension://test/${DEFAULT_REMINDER_AUDIO_PATH}`,
      playbackKind: 'bundled-audio',
      status: 'played',
      errorMessage: null
    });
  });

  it('reports a failed bundled audio playback attempt', async () => {
    const playReminder = createReminderAudioPlayer({
      getAssetUrl: (path) => `chrome-extension://test/${path}`,
      createAudio: () =>
        ({
          currentTime: 0,
          pause: vi.fn(),
          play: vi.fn().mockRejectedValue(new Error('blocked'))
        }) as unknown as HTMLAudioElement
    });

    await expect(playReminder()).resolves.toEqual({
      sourceUrl: `chrome-extension://test/${DEFAULT_REMINDER_AUDIO_PATH}`,
      playbackKind: 'bundled-audio',
      status: 'play-failed',
      errorMessage: 'blocked'
    });
  });
});
