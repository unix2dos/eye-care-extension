import { describe, expect, it, vi } from 'vitest';

import { applyToolbarActionVisuals } from './toolbar-action';
import type { ToolbarIconState } from './icon';

interface MockActionApi {
  setIcon: (details: { tabId?: number; imageData: Record<number, ImageData> }) => Promise<void>;
  setBadgeText: (details: { tabId?: number; text: string }) => Promise<void>;
  setBadgeBackgroundColor: (details: { tabId?: number; color: string }) => Promise<void>;
  setBadgeTextColor: (details: { tabId?: number; color: string }) => Promise<void>;
}

function createActionApi(): MockActionApi {
  return {
    setIcon: vi.fn().mockResolvedValue(undefined),
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    setBadgeTextColor: vi.fn().mockResolvedValue(undefined)
  };
}

describe('applyToolbarActionVisuals', () => {
  it('updates icon and badge for a tab state', async () => {
    const actionApi = createActionApi();

    await applyToolbarActionVisuals({
      actionApi,
      iconState: 'active',
      iconImageData: {} as Record<number, ImageData>,
      tabId: 7
    });

    expect(actionApi.setIcon).toHaveBeenCalledWith({
      tabId: 7,
      imageData: {}
    });
    expect(actionApi.setBadgeText).toHaveBeenCalledWith({
      tabId: 7,
      text: '读'
    });
    expect(actionApi.setBadgeBackgroundColor).toHaveBeenCalledWith({
      tabId: 7,
      color: '#2D6A4F'
    });
    expect(actionApi.setBadgeTextColor).toHaveBeenCalledWith({
      tabId: 7,
      color: '#FFFFFF'
    });
  });

  it('still applies the badge when icon rendering failed upstream', async () => {
    const actionApi = createActionApi();

    await applyToolbarActionVisuals({
      actionApi,
      iconState: 'paused',
      iconImageData: null,
      tabId: 9
    });

    expect(actionApi.setIcon).not.toHaveBeenCalled();
    expect(actionApi.setBadgeText).toHaveBeenCalledWith({
      tabId: 9,
      text: '停'
    });
    expect(actionApi.setBadgeBackgroundColor).toHaveBeenCalledWith({
      tabId: 9,
      color: '#8B8478'
    });
    expect(actionApi.setBadgeTextColor).toHaveBeenCalledWith({
      tabId: 9,
      color: '#FFFFFF'
    });
  });
});
