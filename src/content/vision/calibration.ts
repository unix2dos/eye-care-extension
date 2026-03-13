import type { CalibrationProfile } from '../../shared/types';

export interface CalibrationInput {
  blinkCount: number;
  durationMs: number;
  averageOpenEar: number;
  sampleCount: number;
}

export class CalibrationTracker {
  private blinkCount = 0;
  private openEarSum = 0;
  private openEarCount = 0;

  addObservation(ear: number | null, blinkDetected: boolean): void {
    if (blinkDetected) {
      this.blinkCount += 1;
    }

    if (ear !== null) {
      this.openEarSum += ear;
      this.openEarCount += 1;
    }
  }

  build(durationMs: number): CalibrationProfile | null {
    if (durationMs <= 0 || this.openEarCount === 0) {
      return null;
    }

    return buildCalibrationProfile({
      blinkCount: this.blinkCount,
      durationMs,
      averageOpenEar: this.openEarSum / this.openEarCount,
      sampleCount: this.openEarCount
    });
  }
}

export function buildCalibrationProfile(input: CalibrationInput): CalibrationProfile {
  const blinkRatePerMinute = (input.blinkCount / input.durationMs) * 60_000;
  const blinkThreshold = input.averageOpenEar * 0.75;

  return {
    blinkRatePerMinute: Number(blinkRatePerMinute.toFixed(2)),
    blinkThreshold: Number(blinkThreshold.toFixed(2)),
    averageOpenEar: Number(input.averageOpenEar.toFixed(4)),
    calibratedAt: new Date().toISOString(),
    sampleCount: input.sampleCount
  };
}
