export const DEFAULT_REMINDER_SPEECH = '请休息一下，眨眼几次，再看远处十秒。';

interface ReminderSpeechDeps {
  synthesis?: SpeechSynthesis | null;
  createUtterance?: (text: string) => SpeechSynthesisUtterance;
  voicesChangedTimeoutMs?: number;
}

const MANDARIN_NAME_PATTERN = /(mandarin|普通话|putonghua|tingting|xiaoxiao|xiaoyi|yunxi|yunyang|zh-cn)/i;

function scoreChineseVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();

  if (lang === 'zh-cn' || lang === 'cmn-cn') {
    return 500;
  }

  if (lang.startsWith('zh-cn') || lang.startsWith('cmn-cn')) {
    return 450;
  }

  if (MANDARIN_NAME_PATTERN.test(name)) {
    return 400;
  }

  if (lang.startsWith('cmn')) {
    return 300;
  }

  if (lang.startsWith('zh')) {
    return 200;
  }

  return 0;
}

function pickPreferredChineseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices
      .map((voice) => ({
        voice,
        score: scoreChineseVoice(voice) + (voice.localService ? 5 : 0) + (voice.default ? 1 : 0)
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.voice ?? null
  );
}

async function resolveVoices(synthesis: SpeechSynthesis, timeoutMs: number): Promise<SpeechSynthesisVoice[]> {
  const initialVoices = synthesis.getVoices();
  if (initialVoices.length > 0) {
    return initialVoices;
  }

  return await new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const timer = window.setTimeout(() => {
      cleanup();
      resolve(synthesis.getVoices());
    }, timeoutMs);

    const handleVoicesChanged = () => {
      cleanup();
      resolve(synthesis.getVoices());
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      synthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
    };

    synthesis.addEventListener?.('voiceschanged', handleVoicesChanged, { once: true });
  });
}

export async function speakReminderText(
  text: string = DEFAULT_REMINDER_SPEECH,
  {
    synthesis = window.speechSynthesis ?? null,
    createUtterance = (value) => new SpeechSynthesisUtterance(value),
    voicesChangedTimeoutMs = 300
  }: ReminderSpeechDeps = {}
): Promise<void> {
  if (!synthesis) {
    return;
  }

  const utterance = createUtterance(text);
  const voices = await resolveVoices(synthesis, voicesChangedTimeoutMs);
  const preferredVoice = pickPreferredChineseVoice(voices);

  utterance.lang = preferredVoice?.lang ?? 'zh-CN';
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  utterance.rate = 1;
  synthesis.cancel();
  synthesis.speak(utterance);
}
