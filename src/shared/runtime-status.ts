import { DEFAULT_POLICY } from './constants';
import { REQUEST_RUNTIME_STATUS_COMMAND } from './messages';
import type { PersistedState, RuntimeStatusSnapshot } from './types';
import { isSupportedWeReadUrl } from '../content/weread/adapter';

function isSupportedTab(tab: Pick<chrome.tabs.Tab, 'url'> | null | undefined): boolean {
  if (typeof tab?.url !== 'string') {
    return false;
  }

  try {
    return isSupportedWeReadUrl(new URL(tab.url));
  } catch {
    return false;
  }
}

export function buildFallbackRuntimeStatus(
  state: PersistedState,
  overrides: Partial<RuntimeStatusSnapshot> = {}
): RuntimeStatusSnapshot {
  return {
    isSupportedPage: false,
    isDocumentVisible: false,
    isActiveReading: state.isActiveReading ?? false,
    lastInteractionAt: null,
    activeReadingTimeMs: state.activeReadingTimeMs ?? 0,
    nextEligibleReminderAt: state.nextEligibleReminderAt ?? null,
    inactivityTimeoutMs: DEFAULT_POLICY.inactivityTimeoutMs,
    ...overrides
  };
}

export async function requestRuntimeStatusSnapshot(tabId: number): Promise<RuntimeStatusSnapshot | null> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: REQUEST_RUNTIME_STATUS_COMMAND
    });

    return response && typeof response === 'object' ? (response as RuntimeStatusSnapshot) : null;
  } catch {
    return null;
  }
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] ?? null;
}

export function pickPreferredWeReadTab(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab | null {
  if (tabs.length === 0) {
    return null;
  }

  const activeTab = tabs.find((tab) => tab.active);
  if (activeTab) {
    return activeTab;
  }

  return [...tabs].sort((left, right) => {
    const leftLastAccessed = left.lastAccessed ?? 0;
    const rightLastAccessed = right.lastAccessed ?? 0;

    return rightLastAccessed - leftLastAccessed;
  })[0] ?? null;
}

export async function findPreferredWeReadTab(): Promise<chrome.tabs.Tab | null> {
  const currentWindowTabs = await chrome.tabs.query({
    currentWindow: true,
    url: 'https://weread.qq.com/web/reader/*'
  });
  const currentWindowChoice = pickPreferredWeReadTab(currentWindowTabs);

  if (currentWindowChoice) {
    return currentWindowChoice;
  }

  const allWindowTabs = await chrome.tabs.query({
    url: 'https://weread.qq.com/web/reader/*'
  });

  return pickPreferredWeReadTab(allWindowTabs);
}

export async function resolvePopupRuntimeStatus(
  tab: chrome.tabs.Tab | null,
  persistedState: PersistedState
): Promise<RuntimeStatusSnapshot> {
  if (typeof tab?.id !== 'number' || !isSupportedTab(tab)) {
    return buildFallbackRuntimeStatus(persistedState, {
      isSupportedPage: false,
      isDocumentVisible: false,
      isActiveReading: false,
      activeReadingTimeMs: 0,
      nextEligibleReminderAt: null
    });
  }

  const runtimeStatus = await requestRuntimeStatusSnapshot(tab.id);
  return runtimeStatus ?? buildFallbackRuntimeStatus(persistedState, { isSupportedPage: true });
}

export async function resolveOptionsRuntimeStatus(persistedState: PersistedState): Promise<RuntimeStatusSnapshot> {
  const tab = await findPreferredWeReadTab();
  if (typeof tab?.id !== 'number') {
    return buildFallbackRuntimeStatus(persistedState, {
      isSupportedPage: false,
      isDocumentVisible: false,
      isActiveReading: false,
      activeReadingTimeMs: 0,
      nextEligibleReminderAt: null
    });
  }

  const runtimeStatus = await requestRuntimeStatusSnapshot(tab.id);
  return runtimeStatus ?? buildFallbackRuntimeStatus(persistedState, { isSupportedPage: true });
}
