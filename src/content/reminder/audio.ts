export const DEFAULT_REMINDER_AUDIO_PATH = 'audio/reminder.m4a';

export interface ReminderAudioDebugInfo {
  sourceUrl: string;
  playbackKind: 'bundled-audio';
  status: 'played' | 'play-failed';
  errorMessage: string | null;
}

interface ReminderAudioDeps {
  getAssetUrl?: (path: string) => string;
  createAudio?: (src: string) => HTMLAudioElement;
}

export function createReminderAudioPlayer({
  getAssetUrl = (path) => chrome.runtime.getURL(path),
  createAudio = (src) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    return audio;
  }
}: ReminderAudioDeps = {}): () => Promise<ReminderAudioDebugInfo> {
  const sourceUrl = getAssetUrl(DEFAULT_REMINDER_AUDIO_PATH);
  const audio = createAudio(sourceUrl);

  return async () => {
    audio.pause();

    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers may reject resetting currentTime before metadata loads.
    }

    try {
      await audio.play();

      return {
        sourceUrl,
        playbackKind: 'bundled-audio',
        status: 'played',
        errorMessage: null
      };
    } catch (error) {
      return {
        sourceUrl,
        playbackKind: 'bundled-audio',
        status: 'play-failed',
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    }
  };
}
