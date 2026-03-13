import { shouldDismissReminder, shouldTriggerFallbackReminder, shouldTriggerVisionReminder } from '../../shared/policy';
import type { ReminderPolicyConfig, RuntimeIssueCode, RuntimeMode } from '../../shared/types';
import { classifyRuntimeIssue } from './issues';

export interface VisionObservation {
  now: number;
  faceDetected: boolean;
  blinkDetected: boolean;
  ear: number | null;
}

export interface VisionServiceLike {
  start(): Promise<void>;
}

export interface RuntimeStartupResult {
  mode: RuntimeMode;
  issue: RuntimeIssueCode;
}

export interface ControllerResult {
  reminderTriggered: boolean;
  reminderDismissed: boolean;
  reminderActive: boolean;
  recoveryTimeMs: number | null;
  blinkRatePerMinute: number;
  lowBlinkDetected: boolean;
}

function createResult(overrides: Partial<ControllerResult> = {}): ControllerResult {
  return {
    reminderTriggered: false,
    reminderDismissed: false,
    reminderActive: false,
    recoveryTimeMs: null,
    blinkRatePerMinute: 0,
    lowBlinkDetected: false,
    ...overrides
  };
}

export async function resolveRuntimeStartup(service: VisionServiceLike): Promise<RuntimeStartupResult> {
  try {
    await service.start();
    return {
      mode: 'vision',
      issue: 'none'
    };
  } catch (error) {
    return {
      mode: 'fallback',
      issue: classifyRuntimeIssue(error)
    };
  }
}

export class EyeCareController {
  private policy: ReminderPolicyConfig;
  private readonly blinkTimestamps: number[] = [];
  private focusStartAt: number | null = null;
  private reminderStartedAt: number | null = null;
  private blinksSinceReminder = 0;
  private lastReminderEndedAt: number | null = null;

  constructor(policy: ReminderPolicyConfig) {
    this.policy = policy;
  }

  setPolicy(policy: ReminderPolicyConfig): void {
    this.policy = policy;
  }

  private pruneBlinkWindow(now: number): void {
    const lowerBound = now - this.policy.blinkWindowMs;
    while (this.blinkTimestamps.length > 0 && this.blinkTimestamps[0] < lowerBound) {
      this.blinkTimestamps.shift();
    }
  }

  private getBlinkRatePerMinute(now: number): number {
    this.pruneBlinkWindow(now);
    return this.blinkTimestamps.length / (this.policy.blinkWindowMs / 60_000);
  }

  resetReadingState(): void {
    this.focusStartAt = null;
    this.blinksSinceReminder = 0;
  }

  cancelReminder(now: number): void {
    if (this.reminderStartedAt !== null) {
      this.reminderStartedAt = null;
      this.lastReminderEndedAt = now;
      this.blinksSinceReminder = 0;
    }
  }

  getNextEligibleReminderAt(now: number): number | null {
    if (this.lastReminderEndedAt === null) {
      return null;
    }

    const nextEligibleReminderAt = this.lastReminderEndedAt + this.policy.reminderCooldownMs;
    return nextEligibleReminderAt > now ? nextEligibleReminderAt : null;
  }

  updateVision(
    observation: VisionObservation,
    activeReadingSince: number | null,
    baselineBlinkRatePerMinute: number | null
  ): ControllerResult {
    if (observation.blinkDetected) {
      this.blinkTimestamps.push(observation.now);
    }

    const blinkRatePerMinute = this.getBlinkRatePerMinute(observation.now);
    const lowBlinkDetected =
      baselineBlinkRatePerMinute !== null && blinkRatePerMinute <= baselineBlinkRatePerMinute * this.policy.lowBlinkRatio;

    if (activeReadingSince === null || !observation.faceDetected) {
      this.resetReadingState();
      return createResult({
        reminderActive: this.reminderStartedAt !== null,
        blinkRatePerMinute,
        lowBlinkDetected
      });
    }

    if (this.focusStartAt === null) {
      this.focusStartAt = activeReadingSince;
    }

    if (this.reminderStartedAt !== null) {
      if (observation.blinkDetected) {
        this.blinksSinceReminder += 1;
      }

      const shouldDismiss = shouldDismissReminder(
        {
          reminderStartedAt: this.reminderStartedAt,
          now: observation.now,
          blinksSinceReminder: this.blinksSinceReminder
        },
        this.policy
      );

      if (shouldDismiss) {
        const recoveryTimeMs = observation.now - this.reminderStartedAt;
        this.reminderStartedAt = null;
        this.lastReminderEndedAt = observation.now;
        this.blinksSinceReminder = 0;
        this.focusStartAt = observation.now;

        return createResult({
          reminderDismissed: true,
          reminderActive: false,
          recoveryTimeMs,
          blinkRatePerMinute,
          lowBlinkDetected
        });
      }

      return createResult({
        reminderActive: true,
        blinkRatePerMinute,
        lowBlinkDetected
      });
    }

    if (observation.blinkDetected) {
      this.focusStartAt = observation.now;
    }

    const shouldTrigger = shouldTriggerVisionReminder(
      {
        focusStartAt: this.focusStartAt,
        now: observation.now,
        blinkCountInWindow: this.blinkTimestamps.length,
        baselineBlinkRatePerMinute,
        lastReminderEndedAt: this.lastReminderEndedAt
      },
      this.policy
    );

    if (shouldTrigger) {
      this.reminderStartedAt = observation.now;
      this.blinksSinceReminder = 0;
    }

    return createResult({
      reminderTriggered: shouldTrigger,
      reminderActive: this.reminderStartedAt !== null,
      blinkRatePerMinute,
      lowBlinkDetected
    });
  }

  updateFallback(now: number, activeReadingSince: number | null): ControllerResult {
    if (this.reminderStartedAt !== null) {
      return createResult({
        reminderActive: true,
        blinkRatePerMinute: this.getBlinkRatePerMinute(now)
      });
    }

    const shouldTrigger = shouldTriggerFallbackReminder(
      {
        activeReadingSince,
        now,
        lastReminderEndedAt: this.lastReminderEndedAt
      },
      this.policy
    );

    if (shouldTrigger) {
      this.reminderStartedAt = now;
    }

    return createResult({
      reminderTriggered: shouldTrigger,
      reminderActive: this.reminderStartedAt !== null,
      blinkRatePerMinute: this.getBlinkRatePerMinute(now)
    });
  }

  dismissFallback(now: number): number | null {
    if (this.reminderStartedAt === null) {
      return null;
    }

    const recoveryTimeMs = now - this.reminderStartedAt;
    this.reminderStartedAt = null;
    this.lastReminderEndedAt = now;
    return recoveryTimeMs;
  }
}
