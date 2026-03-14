import { describe, expect, it } from 'vitest';

import { buildToolbarBadge, buildToolbarIconSvg, getToolbarIconState } from './icon';

describe('getToolbarIconState', () => {
  it('shows the active icon only for supported tabs that are actively counting', () => {
    expect(getToolbarIconState({ isSupportedPage: true, isActiveReading: true })).toBe('active');
    expect(getToolbarIconState({ isSupportedPage: true, isActiveReading: false })).toBe('paused');
    expect(getToolbarIconState({ isSupportedPage: false, isActiveReading: true })).toBe('paused');
  });
});

describe('buildToolbarIconSvg', () => {
  it('uses the active green theme for the active icon', () => {
    const svg = buildToolbarIconSvg('active');

    expect(svg).toContain('#9EDB8A');
    expect(svg).toContain('#2D6A4F');
  });

  it('uses the paused gray theme for the paused icon', () => {
    const svg = buildToolbarIconSvg('paused');

    expect(svg).toContain('#D5CFC3');
    expect(svg).toContain('#8B8478');
  });
});

describe('buildToolbarBadge', () => {
  it('uses a green 读 badge for active reading', () => {
    expect(buildToolbarBadge('active')).toEqual({
      text: '读',
      backgroundColor: '#2D6A4F',
      textColor: '#FFFFFF'
    });
  });

  it('uses a gray 停 badge for paused reading', () => {
    expect(buildToolbarBadge('paused')).toEqual({
      text: '停',
      backgroundColor: '#8B8478',
      textColor: '#FFFFFF'
    });
  });
});
