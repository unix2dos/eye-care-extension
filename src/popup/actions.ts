export interface BindPopupActionsOptions {
  root: Document | HTMLElement;
  onEnableSite?: () => void | Promise<void>;
  onPreview: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
}

export function bindPopupActions({
  root,
  onEnableSite,
  onPreview,
  onOpenSettings
}: BindPopupActionsOptions): void {
  root.querySelector<HTMLButtonElement>('#enable-site')?.addEventListener('click', () => {
    void onEnableSite?.();
  });

  root.querySelector<HTMLButtonElement>('#preview-reminder')?.addEventListener('click', () => {
    void onPreview();
  });

  root.querySelector<HTMLButtonElement>('#open-settings')?.addEventListener('click', () => {
    void onOpenSettings();
  });
}
