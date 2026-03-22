import { DEFAULT_REMINDER_SETTINGS, REMINDER_INTERVAL_OPTIONS } from './constants';
import type { ReminderSettings, SubscriptionPlan } from './types';

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlan = 'free';
export const SUBSCRIPTION_PLAN_OPTIONS = ['free', 'pro'] as const satisfies readonly SubscriptionPlan[];
export const CUSTOM_REMINDER_INTERVAL_MINUTES_MIN = 5;
export const CUSTOM_REMINDER_INTERVAL_MINUTES_MAX = 180;
export const FREE_REPORT_RANGE_DAYS = 7 as const;
export const PRO_REPORT_RANGE_DAYS = 30 as const;

export function normalizeSubscriptionPlan(value: unknown): SubscriptionPlan {
  return value === 'pro' ? 'pro' : DEFAULT_SUBSCRIPTION_PLAN;
}

export function isProPlan(plan: SubscriptionPlan): boolean {
  return plan === 'pro';
}

export function canUseBreakGuideAnimation(plan: SubscriptionPlan): boolean {
  return isProPlan(plan);
}

export function canUsePdfExport(plan: SubscriptionPlan): boolean {
  return isProPlan(plan);
}

export function canUseCustomReminderInterval(plan: SubscriptionPlan): boolean {
  return isProPlan(plan);
}

export function isPresetReminderInterval(value: number): value is (typeof REMINDER_INTERVAL_OPTIONS)[number] {
  return REMINDER_INTERVAL_OPTIONS.includes(value as (typeof REMINDER_INTERVAL_OPTIONS)[number]);
}

export function isValidCustomReminderInterval(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= CUSTOM_REMINDER_INTERVAL_MINUTES_MIN &&
    value <= CUSTOM_REMINDER_INTERVAL_MINUTES_MAX
  );
}

export function sanitizeReminderSettingsForPlan(
  settings: ReminderSettings,
  plan: SubscriptionPlan
): ReminderSettings {
  const interval = Math.round(settings.reminderIntervalMinutes);
  const reminderIntervalMinutes = isPresetReminderInterval(interval)
    ? interval
    : canUseCustomReminderInterval(plan) && isValidCustomReminderInterval(interval)
      ? interval
      : DEFAULT_REMINDER_SETTINGS.reminderIntervalMinutes;

  return {
    ...settings,
    reminderIntervalMinutes
  };
}

export function clampReportRangeDays(rangeDays: number, plan: SubscriptionPlan): 7 | 30 {
  return isProPlan(plan) && rangeDays === PRO_REPORT_RANGE_DAYS ? PRO_REPORT_RANGE_DAYS : FREE_REPORT_RANGE_DAYS;
}
