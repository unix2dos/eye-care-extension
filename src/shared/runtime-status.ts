import { DEFAULT_POLICY } from './constants';
import { REQUEST_RUNTIME_STATUS_COMMAND } from './messages';
import type { PersistedState, RuntimeStatusSnapshot } from './types';
import { hasSiteAccess } from './site-access';

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

export function pickPreferredTab(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab | null {
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

async function findPreferredAccessibleTab(tabs: chrome.tabs.Tab[]): Promise<chrome.tabs.Tab | null> {
  const sortedTabs = tabs
    .slice()
    .sort((left, right) => {
      if (left.active === right.active) {
        return (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0);
      }

      return left.active ? -1 : 1;
    });

  for (const tab of sortedTabs) {
    if (await hasSiteAccess(tab.url)) {
      return tab;
    }
  }

  return null;
}

export async function findPreferredSupportedTab(): Promise<chrome.tabs.Tab | null> {
  const currentWindowTabs = await chrome.tabs.query({
    currentWindow: true
  });
  const currentWindowChoice = await findPreferredAccessibleTab(currentWindowTabs);

  if (currentWindowChoice) {
    return currentWindowChoice;
  }

  const allWindowTabs = await chrome.tabs.query({});

  return findPreferredAccessibleTab(allWindowTabs);
}

export async function resolvePopupRuntimeStatus(
  tab: chrome.tabs.Tab | null,
  persistedState: PersistedState
): Promise<RuntimeStatusSnapshot> {
  if (typeof tab?.id !== 'number' || !(await hasSiteAccess(tab.url))) {
    return buildFallbackRuntimeStatus(persistedState, {
      isSupportedPage: false,
      isDocumentVisible: false,
      isActiveReading: false,
      activeReadingTimeMs: 0,
      nextEligibleReminderAt: null
    });
  }

  const runtimeStatus = await requestRuntimeStatusSnapshot(tab.id);
  return runtimeStatus ??
    buildFallbackRuntimeStatus(persistedState, {
      isSupportedPage: true,
      isDocumentVisible: false,
      isActiveReading: false,
      activeReadingTimeMs: 0,
      nextEligibleReminderAt: null
    });
}

export async function resolveOptionsRuntimeStatus(persistedState: PersistedState): Promise<RuntimeStatusSnapshot> {
  const tab = await findPreferredSupportedTab();
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
  return runtimeStatus ??
    buildFallbackRuntimeStatus(persistedState, {
      isSupportedPage: true,
      isDocumentVisible: false,
      isActiveReading: false,
      activeReadingTimeMs: 0,
      nextEligibleReminderAt: null
    });
}
