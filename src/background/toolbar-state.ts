import { hasSiteAccess } from '../shared/site-access';
import type { ToolbarIconState } from './icon';

export async function resolveToolbarIconStateForTab({
  tabUrl,
  runtimeState,
  persistedIsActiveReading
}: {
  tabUrl?: string;
  runtimeState?: ToolbarIconState;
  persistedIsActiveReading: boolean;
}): Promise<ToolbarIconState> {
  if (runtimeState) {
    return runtimeState;
  }

  if (!persistedIsActiveReading || typeof tabUrl !== 'string') {
    return 'paused';
  }

  return (await hasSiteAccess(tabUrl)) ? 'active' : 'paused';
}
