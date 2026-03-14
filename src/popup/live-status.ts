import type { PersistedState } from '../shared/types';

export function derivePopupRuntimeState(
  state: PersistedState,
  popupOpenedAt: number,
  now: number
): PersistedState {
  if (!state.isActiveReading) {
    return state;
  }

  return {
    ...state,
    activeReadingTimeMs: state.activeReadingTimeMs + Math.max(0, now - popupOpenedAt)
  };
}
