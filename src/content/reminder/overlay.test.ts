import { describe, expect, it } from 'vitest';

import { ReminderOverlay } from './overlay';

describe('ReminderOverlay', () => {
  it('shows a full-screen blocking reminder with a dismiss button', async () => {
    document.body.innerHTML = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    const overlay = new ReminderOverlay(document);
    const dismissed = overlay.show('请休息一下', 'reminder');
    const root = document.getElementById('weread-eye-care-overlay') as HTMLDivElement;
    const button = root.querySelector('button');

    expect(root).not.toBeNull();
    expect(root.style.position).toBe('fixed');
    expect(root.style.inset).toBe('0px');
    expect(root.style.display).toBe('flex');
    expect(root.textContent).toContain('请休息一下');
    expect(button?.textContent).toBe('我知道了');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
    expect(overlay.isBlockingReminderVisible()).toBe(true);

    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await dismissed;

    expect(root.style.display).toBe('none');
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(overlay.isBlockingReminderVisible()).toBe(false);
  });

  it('does not treat preview reminders as blocking runtime reminders', async () => {
    document.body.innerHTML = '';

    const overlay = new ReminderOverlay(document);
    const dismissed = overlay.show('预览提醒', 'preview');
    const button = document.querySelector('#weread-eye-care-overlay button');

    expect(overlay.isBlockingReminderVisible()).toBe(false);

    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await dismissed;
  });
});
