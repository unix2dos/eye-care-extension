import { buildToolbarBadge, type ToolbarIconState } from './icon';

interface ActionApiLike {
  setIcon(details: { tabId?: number; imageData: Record<number, ImageData> }): Promise<void>;
  setBadgeText(details: { tabId?: number; text: string }): Promise<void>;
  setBadgeBackgroundColor(details: { tabId?: number; color: string }): Promise<void>;
  setBadgeTextColor(details: { tabId?: number; color: string }): Promise<void>;
}

export interface ApplyToolbarActionVisualsOptions {
  actionApi: ActionApiLike;
  iconState: ToolbarIconState;
  iconImageData: Record<number, ImageData> | null;
  tabId?: number;
}

export async function applyToolbarActionVisuals({
  actionApi,
  iconState,
  iconImageData,
  tabId
}: ApplyToolbarActionVisualsOptions): Promise<void> {
  const badge = buildToolbarBadge(iconState);

  if (iconImageData) {
    if (typeof tabId === 'number') {
      await actionApi.setIcon({ tabId, imageData: iconImageData });
    } else {
      await actionApi.setIcon({ imageData: iconImageData });
    }
  }

  if (typeof tabId === 'number') {
    await actionApi.setBadgeText({ tabId, text: badge.text });
    await actionApi.setBadgeBackgroundColor({ tabId, color: badge.backgroundColor });
    await actionApi.setBadgeTextColor({ tabId, color: badge.textColor });
    return;
  }

  await actionApi.setBadgeText({ text: badge.text });
  await actionApi.setBadgeBackgroundColor({ color: badge.backgroundColor });
  await actionApi.setBadgeTextColor({ color: badge.textColor });
}
