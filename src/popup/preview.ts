import { isSupportedWeReadUrl } from '../content/weread/adapter';

export const PREVIEW_DISABLED_HINT = '仅在微信读书阅读页可预览';
export const PREVIEW_REMINDER_COMMAND = 'preview-reminder';

export interface PreviewReminderState {
  enabled: boolean;
  tabId: number | null;
  hint: string | null;
}

type PreviewTabLike = Pick<chrome.tabs.Tab, 'id' | 'url'> | null | undefined;

export function buildPreviewReminderState(tab: PreviewTabLike): PreviewReminderState {
  if (typeof tab?.id !== 'number' || typeof tab.url !== 'string') {
    return {
      enabled: false,
      tabId: null,
      hint: PREVIEW_DISABLED_HINT
    };
  }

  try {
    const supported = isSupportedWeReadUrl(new URL(tab.url));
    return supported
      ? {
          enabled: true,
          tabId: tab.id,
          hint: null
        }
      : {
          enabled: false,
          tabId: null,
          hint: PREVIEW_DISABLED_HINT
        };
  } catch {
    return {
      enabled: false,
      tabId: null,
      hint: PREVIEW_DISABLED_HINT
    };
  }
}
