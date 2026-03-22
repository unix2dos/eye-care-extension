import { describe, expect, it, vi } from 'vitest';

import { resolveToolbarIconStateForTab } from './toolbar-state';

describe('resolveToolbarIconStateForTab', () => {
  it('uses the live tab state when it exists', async () => {
    await expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://weread.qq.com/web/reader/123',
        runtimeState: 'paused',
        persistedIsActiveReading: true
      })
    ).resolves.toBe('paused');
  });

  it('falls back to persisted reading state for supported tabs when runtime state is missing', async () => {
    await expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://weread.qq.com/web/reader/123',
        persistedIsActiveReading: true
      })
    ).resolves.toBe('active');
  });

  it('keeps tabs without granted host access paused even if persisted reading is active', async () => {
    vi.stubGlobal('chrome', {
      permissions: {
        contains: vi.fn().mockResolvedValue(false)
      }
    });

    await expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://example.com/article',
        persistedIsActiveReading: true
      })
    ).resolves.toBe('paused');
  });

  it('marks granted non-WeRead tabs as active when persisted reading is active', async () => {
    vi.stubGlobal('chrome', {
      permissions: {
        contains: vi.fn().mockResolvedValue(true)
      }
    });

    await expect(
      resolveToolbarIconStateForTab({
        tabUrl: 'https://example.com/article',
        persistedIsActiveReading: true
      })
    ).resolves.toBe('active');
  });
});
