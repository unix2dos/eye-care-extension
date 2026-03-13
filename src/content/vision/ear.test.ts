import { BlinkDetector, calculateEyeAspectRatio } from './ear';

describe('calculateEyeAspectRatio', () => {
  it('computes the expected ratio from six eye landmarks', () => {
    const ratio = calculateEyeAspectRatio([
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 4, y: 0 },
      { x: 2, y: -2 },
      { x: 1, y: -2 }
    ]);

    expect(ratio).toBe(1);
  });
});

describe('BlinkDetector', () => {
  it('emits a blink when the eye closes and opens again', () => {
    const detector = new BlinkDetector(0.22);

    expect(detector.update(0.3)).toBe(false);
    expect(detector.update(0.15)).toBe(false);
    expect(detector.update(0.29)).toBe(true);
  });
});
