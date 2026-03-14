import { describe, expect, it, vi } from 'vitest';

import { bindPopupActions } from './actions';

describe('bindPopupActions', () => {
  it('opens the options page when the settings button is clicked', () => {
    document.body.innerHTML = `
      <button id="preview-reminder">预览提醒</button>
      <button id="open-settings">设置</button>
    `;

    const onPreview = vi.fn();
    const onOpenSettings = vi.fn();

    bindPopupActions({
      root: document,
      onPreview,
      onOpenSettings
    });

    (document.getElementById('open-settings') as HTMLButtonElement).click();

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onPreview).not.toHaveBeenCalled();
  });
});
