export interface BindPopupActionsOptions {
  root: Document | HTMLElement;
  onPreview: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
}

export function bindPopupActions({
  root,
  onPreview,
  onOpenSettings
}: BindPopupActionsOptions): void {
  root.querySelector<HTMLButtonElement>('#preview-reminder')?.addEventListener('click', () => {
    void onPreview();
  });

  root.querySelector<HTMLButtonElement>('#open-settings')?.addEventListener('click', () => {
    void onOpenSettings();
  });
}
