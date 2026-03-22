import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_HOST_PERMISSION_PATTERNS,
  buildOriginPermissionPattern,
  hasSiteAccess,
  isInjectableUrl,
  resolveSiteAccessForUrl,
  resolveTabSiteAccess
} from './site-access';

describe('site access helpers', () => {
  it('keeps WeRead as the only built-in default host permission', () => {
    expect(DEFAULT_HOST_PERMISSION_PATTERNS).toEqual(['https://weread.qq.com/*']);
  });

  it('builds a host permission pattern for regular web origins', () => {
    expect(buildOriginPermissionPattern(new URL('https://example.com/article?id=1'))).toBe('https://example.com/*');
    expect(buildOriginPermissionPattern(new URL('http://localhost:5173/demo'))).toBe('http://localhost:5173/*');
  });

  it('marks only http and https pages as injectable', () => {
    expect(isInjectableUrl(new URL('https://example.com'))).toBe(true);
    expect(isInjectableUrl(new URL('chrome://extensions'))).toBe(false);
  });

  it('treats WeRead reader pages as already accessible', async () => {
    const contains = vi.fn().mockResolvedValue(false);

    await expect(resolveSiteAccessForUrl('https://weread.qq.com/web/reader/123456', contains)).resolves.toEqual({
      hasAccess: true,
      isInjectable: true,
      isWeRead: true,
      originPattern: 'https://weread.qq.com/*'
    });
    expect(contains).not.toHaveBeenCalled();
  });

  it('checks optional host permissions for non-WeRead sites', async () => {
    const contains = vi.fn().mockResolvedValue(true);

    await expect(resolveTabSiteAccess({ url: 'https://example.com/article' }, contains)).resolves.toEqual({
      hasAccess: true,
      isInjectable: true,
      isWeRead: false,
      originPattern: 'https://example.com/*'
    });
    expect(contains).toHaveBeenCalledWith({
      origins: ['https://example.com/*']
    });
  });

  it('rejects restricted pages that cannot request host access', async () => {
    const contains = vi.fn().mockResolvedValue(true);

    await expect(hasSiteAccess('chrome://extensions', contains)).resolves.toBe(false);
    expect(contains).not.toHaveBeenCalled();
  });
});
