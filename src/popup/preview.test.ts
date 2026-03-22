import { describe, expect, it } from 'vitest';

import { buildPreviewReminderState } from './preview';

describe('buildPreviewReminderState', () => {
  it('enables preview on an enabled tab', () => {
    const state = buildPreviewReminderState({
      id: 42,
      url: 'https://weread.qq.com/web/reader/123456'
    }, true);

    expect(state.enabled).toBe(true);
    expect(state.tabId).toBe(42);
    expect(state.hint).toBeNull();
  });

  it('disables preview when the current page is not enabled', () => {
    const state = buildPreviewReminderState({
      id: 7,
      url: 'https://example.com/article'
    }, false);

    expect(state.enabled).toBe(false);
    expect(state.tabId).toBeNull();
    expect(state.hint).toBe('当前页面未启用护眼提醒');
  });

  it('disables preview when the popup cannot inspect the tab id', () => {
    const state = buildPreviewReminderState({
      id: 9
    }, true);

    expect(state.enabled).toBe(true);
    expect(state.tabId).toBe(9);
    expect(state.hint).toBeNull();
  });

  it('disables preview when the popup cannot inspect the tab id or the site is not enabled', () => {
    const state = buildPreviewReminderState({
      url: 'https://example.com/article'
    }, true);

    expect(state.enabled).toBe(false);
    expect(state.tabId).toBeNull();
    expect(state.hint).toBe('当前页面未启用护眼提醒');
  });
});
