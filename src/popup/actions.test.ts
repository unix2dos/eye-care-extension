import { describe, expect, it, vi } from 'vitest';

import { bindPopupActions } from './actions';

describe('bindPopupActions', () => {
  it('triggers the enable action when the site button is clicked', () => {
    document.body.innerHTML = `
      <button id="enable-site">启用</button>
      <button id="preview-reminder">预览提醒</button>
      <button id="open-settings">设置</button>
    `;

    const onEnableSite = vi.fn();
    const onPreview = vi.fn();
    const onOpenSettings = vi.fn();

    bindPopupActions({
      root: document,
      onEnableSite,
      onPreview,
      onOpenSettings
    });

    (document.getElementById('enable-site') as HTMLButtonElement).click();

    expect(onEnableSite).toHaveBeenCalledTimes(1);
    expect(onPreview).not.toHaveBeenCalled();
    expect(onOpenSettings).not.toHaveBeenCalled();
  });

  it('opens the options page when the settings button is clicked', () => {
    document.body.innerHTML = `
      <button id="preview-reminder">预览提醒</button>
      <button id="open-settings">设置</button>
    `;

    const onPreview = vi.fn();
    const onOpenSettings = vi.fn();

    bindPopupActions({
      root: document,
      onEnableSite: vi.fn(),
      onPreview,
      onOpenSettings
    });

    (document.getElementById('open-settings') as HTMLButtonElement).click();

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onPreview).not.toHaveBeenCalled();
  });
});
