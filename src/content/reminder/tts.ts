export const DEFAULT_REMINDER_SPEECH = '请休息一下，眨眼几次，再看远处十秒。';
export const PREFERRED_MAINLAND_VOICE_NAME = 'Eddy (中文（中国大陆）)';

interface ReminderSpeechDeps {
  synthesis?: SpeechSynthesis | null;
  createUtterance?: (text: string) => SpeechSynthesisUtterance;
  voicesChangedTimeoutMs?: number;
}

export type ReminderSpeechSelectionKind =
  | 'preferred-exact'
  | 'mainland-fallback'
  | 'no-selected-voice'
  | 'synthesis-unavailable'
  | 'speak-failed';

export interface ReminderSpeechDebugInfo {
  preferredVoiceName: string;
  selectedVoiceName: string | null;
  selectedVoiceLang: string | null;
  fallbackUsed: boolean;
  selectionKind: ReminderSpeechSelectionKind;
  errorMessage: string | null;
}

function normalizeVoiceName(name: string): string {
  return name.replace(/\s+/g, '').toLowerCase();
}

function isPreferredEddyVoice(voice: SpeechSynthesisVoice): boolean {
  const normalizedName = normalizeVoiceName(voice.name);
  const lang = voice.lang.toLowerCase();

  return normalizedName.includes('eddy') && (lang.startsWith('zh-cn') || lang === 'zh-cn' || voice.name.includes('中国大陆'));
}

function isMainlandMandarinVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();

  if (lang === 'zh-cn' || lang === 'cmn-cn' || lang.startsWith('zh-cn') || lang.startsWith('cmn-cn')) {
    return true;
  }

  if (name.includes('中国大陆')) {
    return true;
  }

  return false;
}

function pickPreferredChineseVoice(
  voices: SpeechSynthesisVoice[]
): Pick<ReminderSpeechDebugInfo, 'selectedVoiceName' | 'selectedVoiceLang' | 'fallbackUsed' | 'selectionKind'> & {
  voice: SpeechSynthesisVoice | null;
} {
  const exactPreferred = voices.find(isPreferredEddyVoice);

  if (exactPreferred) {
    return {
      voice: exactPreferred,
      selectedVoiceName: exactPreferred.name,
      selectedVoiceLang: exactPreferred.lang,
      fallbackUsed: false,
      selectionKind: 'preferred-exact'
    };
  }

  const mainlandFallback = voices.find(isMainlandMandarinVoice);
  if (mainlandFallback) {
    return {
      voice: mainlandFallback,
      selectedVoiceName: mainlandFallback.name,
      selectedVoiceLang: mainlandFallback.lang,
      fallbackUsed: true,
      selectionKind: 'mainland-fallback'
    };
  }

  return {
    voice: null,
    selectedVoiceName: null,
    selectedVoiceLang: null,
    fallbackUsed: true,
    selectionKind: 'no-selected-voice'
  };
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
): Promise<ReminderSpeechDebugInfo> {
  if (!synthesis) {
    return {
      preferredVoiceName: PREFERRED_MAINLAND_VOICE_NAME,
      selectedVoiceName: null,
      selectedVoiceLang: null,
      fallbackUsed: true,
      selectionKind: 'synthesis-unavailable',
      errorMessage: null
    };
  }

  const utterance = createUtterance(text);
  const voices = await resolveVoices(synthesis, voicesChangedTimeoutMs);
  const selection = pickPreferredChineseVoice(voices);

  utterance.lang = selection.selectedVoiceLang ?? 'zh-CN';
  if (selection.voice) {
    utterance.voice = selection.voice;
  }
  utterance.rate = 1;

  try {
    synthesis.cancel();
    synthesis.speak(utterance);

    return {
      preferredVoiceName: PREFERRED_MAINLAND_VOICE_NAME,
      selectedVoiceName: selection.selectedVoiceName,
      selectedVoiceLang: selection.selectedVoiceLang,
      fallbackUsed: selection.fallbackUsed,
      selectionKind: selection.selectionKind,
      errorMessage: null
    };
  } catch (error) {
    return {
      preferredVoiceName: PREFERRED_MAINLAND_VOICE_NAME,
      selectedVoiceName: selection.selectedVoiceName,
      selectedVoiceLang: selection.selectedVoiceLang,
      fallbackUsed: selection.fallbackUsed,
      selectionKind: 'speak-failed',
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}
