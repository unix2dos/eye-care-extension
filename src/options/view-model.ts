import { buildReminderStatusSummary, buildRuntimeStatusDetails, buildStatsSummary } from '../ui/summary';
import type { PersistedState, RuntimeStatusSnapshot } from '../shared/types';

export interface OptionsViewModel {
  readingStatusLabel: string;
  nextReminderLabel: string;
  statusExplanationLabel: string;
  runtimeDetails: ReturnType<typeof buildRuntimeStatusDetails>;
  summary: ReturnType<typeof buildStatsSummary>;
}

export function buildOptionsViewModel(
  state: PersistedState,
  runtimeStatus: RuntimeStatusSnapshot,
  todayDate: string,
  now = Date.now()
): OptionsViewModel {
  const status = buildReminderStatusSummary(runtimeStatus, now);

  return {
    readingStatusLabel: status.readingStatusLabel,
    nextReminderLabel: status.nextEligibleReminderLabel,
    statusExplanationLabel: status.statusExplanationLabel,
    runtimeDetails: buildRuntimeStatusDetails(runtimeStatus, now),
    summary: buildStatsSummary(state.stats, todayDate)
  };
}
