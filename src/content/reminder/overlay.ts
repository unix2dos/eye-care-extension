const OVERLAY_ID = 'weread-eye-care-overlay';
const DISMISS_BUTTON_LABEL = '我知道了';

function ensureOverlayElement(doc: Document): HTMLDivElement {
  const existing = doc.getElementById(OVERLAY_ID);
  if (existing instanceof HTMLDivElement) {
    return existing;
  }

  const element = doc.createElement('div');
  element.id = OVERLAY_ID;
  element.style.position = 'fixed';
  element.style.inset = '0';
  element.style.zIndex = '2147483647';
  element.style.display = 'none';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.padding = '32px';
  element.style.background = 'rgba(14, 16, 19, 0.94)';
  element.style.color = '#f6f3ec';
  element.style.font = '15px/1.6 -apple-system, BlinkMacSystemFont, sans-serif';
  element.style.pointerEvents = 'auto';
  element.innerHTML = `
    <div
      style="
        width: min(560px, 100%);
        padding: 32px 28px;
        border-radius: 24px;
        background: #f7f1e7;
        color: #1d1c19;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.32);
        text-align: center;
      "
    >
      <div
        data-role="message"
        style="
          font-size: 28px;
          line-height: 1.5;
          font-weight: 700;
          margin-bottom: 24px;
        "
      ></div>
      <button
        type="button"
        data-role="dismiss"
        style="
          min-width: 180px;
          padding: 14px 22px;
          border: none;
          border-radius: 999px;
          background: #1d1c19;
          color: #f7f1e7;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
        "
      >${DISMISS_BUTTON_LABEL}</button>
    </div>
  `;
  (doc.body ?? doc.documentElement).appendChild(element);
  return element;
}

export type ReminderOverlayMode = 'preview' | 'reminder';
export type ReminderOverlayPresentation = 'fullscreen' | 'compact';

export class ReminderOverlay {
  private readonly doc: Document;
  private readonly element: HTMLDivElement;
  private readonly panelElement: HTMLDivElement;
  private readonly messageElement: HTMLDivElement;
  private readonly dismissButton: HTMLButtonElement;
  private dismissPromise: Promise<void> | null = null;
  private resolveDismiss: (() => void) | null = null;
  private activeMode: ReminderOverlayMode | null = null;
  private activePresentation: ReminderOverlayPresentation | null = null;
  private previousHtmlOverflow = '';
  private previousBodyOverflow = '';

  constructor(doc: Document) {
    this.doc = doc;
    this.element = ensureOverlayElement(doc);
    const panelElement = this.element.firstElementChild;
    const messageElement = this.element.querySelector('[data-role="message"]');
    const dismissButton = this.element.querySelector('[data-role="dismiss"]');

    if (
      !(panelElement instanceof HTMLDivElement) ||
      !(messageElement instanceof HTMLDivElement) ||
      !(dismissButton instanceof HTMLButtonElement)
    ) {
      throw new Error('Reminder overlay structure is incomplete.');
    }

    this.panelElement = panelElement;
    this.messageElement = messageElement;
    this.dismissButton = dismissButton;
    this.dismissButton.addEventListener('click', () => {
      this.hide();
    });
  }

  private applyPresentation(presentation: ReminderOverlayPresentation): void {
    if (presentation === 'compact') {
      this.element.style.inset = 'auto 24px 24px auto';
      this.element.style.padding = '0';
      this.element.style.background = 'transparent';
      this.element.style.display = 'block';
      this.element.style.width = 'min(360px, calc(100vw - 48px))';
      this.panelElement.style.width = '100%';
      this.panelElement.style.padding = '20px 20px 18px';
      this.panelElement.style.borderRadius = '18px';
      this.messageElement.style.fontSize = '22px';
      this.messageElement.style.marginBottom = '18px';
      return;
    }

    this.element.style.inset = '0';
    this.element.style.padding = '32px';
    this.element.style.background = 'rgba(14, 16, 19, 0.94)';
    this.element.style.display = 'flex';
    this.element.style.width = '';
    this.panelElement.style.width = 'min(560px, 100%)';
    this.panelElement.style.padding = '32px 28px';
    this.panelElement.style.borderRadius = '24px';
    this.messageElement.style.fontSize = '28px';
    this.messageElement.style.marginBottom = '24px';
  }

  show(
    message: string,
    mode: ReminderOverlayMode = 'reminder',
    presentation: ReminderOverlayPresentation = 'fullscreen'
  ): Promise<void> {
    this.activeMode = mode;
    this.activePresentation = presentation;
    this.messageElement.textContent = message;
    this.applyPresentation(presentation);

    if (presentation === 'fullscreen') {
      this.previousHtmlOverflow = this.doc.documentElement.style.overflow;
      this.previousBodyOverflow = this.doc.body.style.overflow;
      this.doc.documentElement.style.overflow = 'hidden';
      this.doc.body.style.overflow = 'hidden';
    }

    this.dismissButton.focus();

    if (!this.dismissPromise) {
      this.dismissPromise = new Promise<void>((resolve) => {
        this.resolveDismiss = resolve;
      });
    }

    return this.dismissPromise;
  }

  hide(): void {
    this.activeMode = null;
    this.activePresentation = null;
    this.element.style.display = 'none';
    this.doc.documentElement.style.overflow = this.previousHtmlOverflow;
    this.doc.body.style.overflow = this.previousBodyOverflow;

    const resolve = this.resolveDismiss;
    this.dismissPromise = null;
    this.resolveDismiss = null;
    resolve?.();
  }

  isBlockingReminderVisible(): boolean {
    return (
      this.element.style.display !== 'none' &&
      this.activeMode === 'reminder' &&
      this.activePresentation === 'fullscreen'
    );
  }

  isVisible(): boolean {
    return this.element.style.display !== 'none';
  }
}
