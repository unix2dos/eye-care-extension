import { describe, expect, it } from 'vitest';

import { buildPreviewReminderState } from './preview';

describe('buildPreviewReminderState', () => {
  it('enables preview on WeRead reader tabs', () => {
    const state = buildPreviewReminderState({
      id: 42,
      url: 'https://weread.qq.com/web/reader/123456'
    });

    expect(state.enabled).toBe(true);
    expect(state.tabId).toBe(42);
    expect(state.hint).toBeNull();
  });

  it('disables preview on unsupported tabs', () => {
    const state = buildPreviewReminderState({
      id: 7,
      url: 'https://example.com/article'
    });

    expect(state.enabled).toBe(false);
    expect(state.tabId).toBeNull();
    expect(state.hint).toBe('仅在微信读书阅读页可预览');
  });

  it('disables preview when the popup cannot inspect the tab url', () => {
    const state = buildPreviewReminderState({
      id: 9
    });

    expect(state.enabled).toBe(false);
    expect(state.tabId).toBeNull();
    expect(state.hint).toBe('仅在微信读书阅读页可预览');
  });
});
