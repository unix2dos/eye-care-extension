import { buildToolbarIconSvg, getToolbarIconState, type ToolbarIconState } from './icon';
import { TOOLBAR_ICON_STATE_COMMAND, type ToolbarIconStateMessage } from '../shared/messages';
import { applyToolbarActionVisuals } from './toolbar-action';
import { resolveToolbarIconStateForTab } from './toolbar-state';
import { AppStorage } from '../shared/storage';
import { resolveTabSiteAccess } from '../shared/site-access';

const ICON_SIZES = [16, 32] as const;
const CONTENT_SCRIPT_FILES = ['content/main.js'];
const tabStates = new Map<number, ToolbarIconState>();
const iconCache = new Map<ToolbarIconState, Promise<Record<number, ImageData>>>();
const storage = new AppStorage();

async function renderSvgToImageData(svg: string, size: number): Promise<ImageData> {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const bitmap = await createImageBitmap(blob, {
    resizeWidth: size,
    resizeHeight: size
  });
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to render toolbar icon.');
  }

  context.clearRect(0, 0, size, size);
  context.drawImage(bitmap, 0, 0, size, size);
  return context.getImageData(0, 0, size, size);
}

function getIconImageData(state: ToolbarIconState): Promise<Record<number, ImageData>> {
  const cached = iconCache.get(state);
  if (cached) {
    return cached;
  }

  const renderPromise = Promise.all(
    ICON_SIZES.map(async (size) => [size, await renderSvgToImageData(buildToolbarIconSvg(state), size)] as const)
  ).then((entries) => Object.fromEntries(entries));

  iconCache.set(state, renderPromise);
  return renderPromise;
}

async function injectContentScriptIfNeeded(tab?: chrome.tabs.Tab): Promise<void> {
  if (typeof tab?.id !== 'number') {
    return;
  }

  const siteAccess = await resolveTabSiteAccess(tab);
  if (!siteAccess.hasAccess || siteAccess.isWeRead) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: CONTENT_SCRIPT_FILES
    });
  } catch (error) {
    console.warn('Failed to inject the content script for the current tab.', error);
  }
}

async function applyToolbarIconForTab(tab?: chrome.tabs.Tab): Promise<void> {
  const persisted = await storage.loadState();
  const iconState = await resolveToolbarIconStateForTab({
    tabUrl: tab?.url,
    runtimeState: typeof tab?.id === 'number' ? tabStates.get(tab.id) : undefined,
    persistedIsActiveReading: persisted.isActiveReading
  });
  let imageData: Record<number, ImageData> | null = null;

  try {
    imageData = await getIconImageData(iconState);
  } catch (error) {
    console.warn('Failed to render toolbar icon, falling back to badge-only state.', error);
  }

  await applyToolbarActionVisuals({
    actionApi: chrome.action,
    iconState,
    iconImageData: imageData,
    tabId: tab?.id
  });
}

async function refreshActiveTabIcon(): Promise<void> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await injectContentScriptIfNeeded(activeTab);
  await applyToolbarIconForTab(activeTab);
}

chrome.runtime.onInstalled.addListener(() => {
  console.info('WeRead Eye Care extension installed.');
  void refreshActiveTabIcon();
});

chrome.runtime.onStartup.addListener(() => {
  void refreshActiveTabIcon();
});

chrome.runtime.onMessage.addListener((message: ToolbarIconStateMessage, sender) => {
  if (message?.type !== TOOLBAR_ICON_STATE_COMMAND || typeof sender.tab?.id !== 'number') {
    return false;
  }

  const tabId = sender.tab.id;
  tabStates.set(
    tabId,
    getToolbarIconState({
      isSupportedPage: message.isSupportedPage,
      isActiveReading: message.isActiveReading
    })
  );

  void chrome.tabs
    .query({ active: true, currentWindow: true })
    .then(([activeTab]) => {
      if (activeTab?.id === tabId) {
        return applyToolbarIconForTab(activeTab);
      }
    })
    .catch(() => undefined);

  return false;
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void chrome.tabs
    .get(tabId)
    .then(async (tab) => {
      await injectContentScriptIfNeeded(tab);
      await applyToolbarIconForTab(tab);
    })
    .catch(() => undefined);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    tabStates.delete(tabId);

    if (tab.active) {
      void applyToolbarIconForTab(tab);
    }

    return;
  }

  if (changeInfo.status === 'complete') {
    void injectContentScriptIfNeeded(tab);
    if (tab.active) {
      void applyToolbarIconForTab(tab);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});
