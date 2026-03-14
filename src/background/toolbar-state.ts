import { isSupportedWeReadUrl } from '../content/weread/adapter';
import type { ToolbarIconState } from './icon';

export function resolveToolbarIconStateForTab({
  tabUrl,
  runtimeState,
  persistedIsActiveReading
}: {
  tabUrl?: string;
  runtimeState?: ToolbarIconState;
  persistedIsActiveReading: boolean;
}): ToolbarIconState {
  if (runtimeState) {
    return runtimeState;
  }

  if (typeof tabUrl !== 'string') {
    return 'paused';
  }

  try {
    return isSupportedWeReadUrl(new URL(tabUrl)) && persistedIsActiveReading ? 'active' : 'paused';
  } catch {
    return 'paused';
  }
}
