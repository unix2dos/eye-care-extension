export const PREVIEW_DISABLED_HINT = '当前页面未启用护眼提醒';
export const PREVIEW_REMINDER_COMMAND = 'preview-reminder';

export interface PreviewReminderState {
  enabled: boolean;
  tabId: number | null;
  hint: string | null;
}

type PreviewTabLike = Pick<chrome.tabs.Tab, 'id' | 'url'> | null | undefined;

export function buildPreviewReminderState(tab: PreviewTabLike, hasAccess: boolean): PreviewReminderState {
  if (typeof tab?.id !== 'number' || !hasAccess) {
    return {
      enabled: false,
      tabId: null,
      hint: PREVIEW_DISABLED_HINT
    };
  }

  return {
    enabled: true,
    tabId: tab.id,
    hint: null
  };
}
