import { describe, expect, it, vi } from 'vitest';

import { buildExportFilename, downloadCsv } from './export';

describe('options export helpers', () => {
  it('builds a stable csv filename for the current day', () => {
    expect(buildExportFilename('2026-03-14')).toBe('weread-eye-care-2026-03-14.csv');
  });

  it('downloads csv contents through a temporary object URL', () => {
    const anchor = {
      href: '',
      download: '',
      click: vi.fn()
    } as unknown as HTMLAnchorElement;
    const createObjectURL = vi.fn(() => 'blob:demo');
    const revokeObjectURL = vi.fn();
    const createElement = vi.fn(((tagName: string) => {
      expect(tagName).toBe('a');
      return anchor;
    }) as (tagName: string) => HTMLAnchorElement);
    const setTimeout = vi.fn(((handler: TimerHandler) => {
      if (typeof handler === 'function') {
        handler();
      }
      return 0;
    }) as typeof window.setTimeout);

    downloadCsv('demo.csv', 'a,b', {
      createObjectURL,
      revokeObjectURL,
      createElement,
      setTimeout
    });

    expect(createElement).toHaveBeenCalledWith('a');
    expect(anchor.href).toBe('blob:demo');
    expect(anchor.download).toBe('demo.csv');
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:demo');
  });
});
