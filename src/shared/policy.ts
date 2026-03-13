import type {
  DismissReminderInput,
  FallbackReminderInput,
  ReminderPolicyConfig,
  VisionReminderInput
} from './types';

function isOutsideCooldown(now: number, lastReminderEndedAt: number | null, reminderCooldownMs: number): boolean {
  return lastReminderEndedAt === null || now - lastReminderEndedAt >= reminderCooldownMs;
}

export function shouldTriggerVisionReminder(
  input: VisionReminderInput,
  policy: ReminderPolicyConfig
): boolean {
  if (input.focusStartAt === null || input.baselineBlinkRatePerMinute === null || input.baselineBlinkRatePerMinute <= 0) {
    return false;
  }

  if (input.now - input.focusStartAt < policy.focusThresholdMs) {
    return false;
  }

  if (!isOutsideCooldown(input.now, input.lastReminderEndedAt, policy.reminderCooldownMs)) {
    return false;
  }

  const observedBlinkRate = input.blinkCountInWindow / (policy.blinkWindowMs / 60_000);
  return observedBlinkRate <= input.baselineBlinkRatePerMinute * policy.lowBlinkRatio;
}

export function shouldDismissReminder(input: DismissReminderInput, policy: ReminderPolicyConfig): boolean {
  return input.now - input.reminderStartedAt <= policy.recoveryWindowMs && input.blinksSinceReminder >= policy.recoveryBlinkCount;
}

export function shouldTriggerFallbackReminder(
  input: FallbackReminderInput,
  policy: ReminderPolicyConfig
): boolean {
  if (input.activeReadingSince === null) {
    return false;
  }

  if (!isOutsideCooldown(input.now, input.lastReminderEndedAt, policy.reminderCooldownMs)) {
    return false;
  }

  return input.now - input.activeReadingSince >= policy.fallbackReminderIntervalMs;
}
