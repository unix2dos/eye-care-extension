import { describe, expect, it } from 'vitest';

import { resolveToolbarIconStateForTab } from './toolbar-state';

describe('resolveToolbarIconStateForTab', () => {
  it('uses the live tab state when it exists', () => {
    expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://weread.qq.com/web/reader/123',
        runtimeState: 'paused',
        persistedIsActiveReading: true
      })
    ).toBe('paused');
  });

  it('falls back to persisted reading state for supported tabs when runtime state is missing', () => {
    expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://weread.qq.com/web/reader/123',
        persistedIsActiveReading: true
      })
    ).toBe('active');
  });

  it('keeps unsupported tabs paused even if persisted reading is active', () => {
    expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://example.com/article',
        persistedIsActiveReading: true
      })
    ).toBe('paused');
  });
});
