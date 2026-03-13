export const DEFAULT_REMINDER_SPEECH = '请休息一下，眨眼几次，再看远处十秒。';

interface ReminderSpeechDeps {
  synthesis?: SpeechSynthesis | null;
  createUtterance?: (text: string) => SpeechSynthesisUtterance;
}

export async function speakReminderText(
  text: string = DEFAULT_REMINDER_SPEECH,
  {
    synthesis = window.speechSynthesis ?? null,
    createUtterance = (value) => new SpeechSynthesisUtterance(value)
  }: ReminderSpeechDeps = {}
): Promise<void> {
  if (!synthesis) {
    return;
  }

  const utterance = createUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1;
  synthesis.cancel();
  synthesis.speak(utterance);
}
