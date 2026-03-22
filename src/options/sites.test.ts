import { describe, expect, it, vi } from 'vitest';

import {
  buildEnabledSites,
  buildEnabledSitesMarkup,
  formatEnabledSiteLabel,
  isUserGrantedSiteOrigin,
  loadEnabledSites,
  removeEnabledSite
} from './sites';

describe('options enabled sites helpers', () => {
  it('filters out default and broad host permission patterns', () => {
    expect(isUserGrantedSiteOrigin('https://weread.qq.com/*')).toBe(false);
    expect(isUserGrantedSiteOrigin('https://*/*')).toBe(false);
    expect(isUserGrantedSiteOrigin('https://example.com/*')).toBe(true);
    expect(isUserGrantedSiteOrigin('chrome://extensions/*')).toBe(false);
  });

  it('formats site labels from origin patterns', () => {
    expect(formatEnabledSiteLabel('https://example.com/*')).toBe('example.com');
    expect(formatEnabledSiteLabel('http://localhost:5173/*')).toBe('localhost:5173');
  });

  it('builds a sorted unique enabled site list', () => {
    expect(
      buildEnabledSites([
        'https://weread.qq.com/*',
        'https://b.example.com/*',
        'https://a.example.com/*',
        'https://a.example.com/*',
        'https://*/*'
      ])
    ).toEqual([
      { origin: 'https://a.example.com/*', label: 'a.example.com' },
      { origin: 'https://b.example.com/*', label: 'b.example.com' }
    ]);
  });

  it('loads enabled sites from chrome permissions', async () => {
    const getAll = vi.fn().mockResolvedValue({
      origins: ['https://weread.qq.com/*', 'https://example.com/*']
    });

    await expect(loadEnabledSites(getAll)).resolves.toEqual([
      { origin: 'https://example.com/*', label: 'example.com' }
    ]);
  });

  it('removes a site origin through chrome permissions', async () => {
    const remove = vi.fn().mockResolvedValue(true);

    await expect(removeEnabledSite('https://example.com/*', remove)).resolves.toBe(true);
    expect(remove).toHaveBeenCalledWith({
      origins: ['https://example.com/*']
    });
  });

  it('renders an empty state when no optional sites are enabled', () => {
    expect(buildEnabledSitesMarkup([])).toContain('暂时没有通过 popup 启用的站点。');
  });

  it('renders removable enabled site rows', () => {
    const markup = buildEnabledSitesMarkup([
      { origin: 'https://example.com/*', label: 'example.com' }
    ]);

    expect(markup).toContain('example.com');
    expect(markup).toContain('data-remove-origin="https://example.com/*"');
    expect(markup).toContain('移除');
  });
});
