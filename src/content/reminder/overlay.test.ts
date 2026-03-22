import { describe, expect, it, vi } from 'vitest';

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

  it('can render a compact reminder without blocking page scroll', async () => {
    document.body.innerHTML = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    const overlay = new ReminderOverlay(document);
    const dismissed = overlay.show('请休息一下', 'reminder', 'compact');
    const root = document.getElementById('weread-eye-care-overlay') as HTMLDivElement;
    const button = root.querySelector('button');

    expect(root.style.inset).toBe('auto 24px 24px auto');
    expect(root.style.background).toBe('transparent');
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(overlay.isBlockingReminderVisible()).toBe(false);

    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await dismissed;
  });

  it('prevents dismissal until the countdown finishes', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '';

    try {
      const overlay = new ReminderOverlay(document);
      const dismissed = overlay.show('请看远处 20 秒', 'reminder', 'fullscreen', 3);
      const root = document.getElementById('weread-eye-care-overlay') as HTMLDivElement;
      const button = root.querySelector('button') as HTMLButtonElement;

      expect(button.disabled).toBe(true);
      expect(button.textContent).toBe('3 秒后可关闭');
      expect(root.textContent).toContain('请先看远处 3 秒');

      button.click();
      expect(overlay.isVisible()).toBe(true);

      await vi.advanceTimersByTimeAsync(2_000);
      expect(button.disabled).toBe(true);
      expect(button.textContent).toBe('1 秒后可关闭');

      await vi.advanceTimersByTimeAsync(1_000);
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe('我知道了');

      button.click();
      await dismissed;

      expect(overlay.isVisible()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
