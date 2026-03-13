export async function playReminderTone(): Promise<void> {
  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.frequency.value = 880;
  oscillator.type = 'sine';
  gainNode.gain.value = 0.02;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);

  await new Promise<void>((resolve) => {
    oscillator.onended = () => {
      void context.close().finally(resolve);
    };
  });
}
