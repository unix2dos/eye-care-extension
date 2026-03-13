import { DEFAULT_POLICY } from '../../shared/constants';
import { EyeCareController, resolveRuntimeMode } from './controller';

describe('resolveRuntimeMode', () => {
  it('falls back when vision startup fails', async () => {
    await expect(
      resolveRuntimeMode({
        start: async () => {
          throw new Error('camera denied');
        }
      })
    ).resolves.toBe('fallback');
  });
});

describe('EyeCareController', () => {
  it('triggers and dismisses a reminder from blink signals', () => {
    const controller = new EyeCareController(DEFAULT_POLICY);

    const trigger = controller.updateVision(
      { now: 25_000, faceDetected: true, blinkDetected: false, ear: 0.3 },
      0,
      20
    );

    expect(trigger.reminderTriggered).toBe(true);

    controller.updateVision({ now: 26_000, faceDetected: true, blinkDetected: true, ear: 0.1 }, 0, 20);
    controller.updateVision({ now: 27_000, faceDetected: true, blinkDetected: true, ear: 0.1 }, 0, 20);
    const dismiss = controller.updateVision({ now: 28_000, faceDetected: true, blinkDetected: true, ear: 0.3 }, 0, 20);

    expect(dismiss.reminderDismissed).toBe(true);
  });
});
