import { DEFAULT_POLICY } from '../../shared/constants';
import { EyeCareController, resolveRuntimeStartup } from './controller';

describe('resolveRuntimeStartup', () => {
  it('falls back with a classified permission error when vision startup fails', async () => {
    await expect(
      resolveRuntimeStartup({
        start: async () => {
          const error = new Error('camera denied');
          error.name = 'NotAllowedError';
          throw error;
        }
      })
    ).resolves.toEqual({
      mode: 'fallback',
      issue: 'permission-denied'
    });
  });
});

describe('EyeCareController', () => {
  it('triggers and dismisses a reminder from blink signals and derives the next eligible reminder time', () => {
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
    expect(controller.getNextEligibleReminderAt(28_000)).toBe(208_000);
    expect(controller.getNextEligibleReminderAt(208_001)).toBeNull();
  });
});
