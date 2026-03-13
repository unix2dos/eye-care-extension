import { buildReminderStatusSummary, buildStatsSummary } from '../ui/summary';
import type { PersistedState } from '../shared/types';

export interface OptionsViewModel {
  readingStatusLabel: string;
  nextReminderLabel: string;
  summary: ReturnType<typeof buildStatsSummary>;
}

export function buildOptionsViewModel(state: PersistedState, todayDate: string, now = Date.now()): OptionsViewModel {
  const status = buildReminderStatusSummary(state, now);

  return {
    readingStatusLabel: status.readingStatusLabel,
    nextReminderLabel: status.nextEligibleReminderLabel,
    summary: buildStatsSummary(state.stats, todayDate)
  };
}
