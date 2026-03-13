import { buildCalibrationProfile } from './calibration';

describe('buildCalibrationProfile', () => {
  it('derives blink rate and threshold from a calibration sample', () => {
    const profile = buildCalibrationProfile({
      blinkCount: 15,
      durationMs: 45_000,
      averageOpenEar: 0.32,
      sampleCount: 135
    });

    expect(profile.blinkRatePerMinute).toBe(20);
    expect(profile.blinkThreshold).toBe(0.24);
    expect(profile.sampleCount).toBe(135);
  });
});
