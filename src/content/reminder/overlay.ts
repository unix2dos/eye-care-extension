const OVERLAY_ID = 'weread-eye-care-overlay';

function ensureOverlayElement(doc: Document): HTMLDivElement {
  const existing = doc.getElementById(OVERLAY_ID);
  if (existing instanceof HTMLDivElement) {
    return existing;
  }

  const element = doc.createElement('div');
  element.id = OVERLAY_ID;
  element.style.cssText = `
    position: fixed;
    right: 24px;
    top: 24px;
    z-index: 2147483647;
    min-width: 220px;
    max-width: 320px;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba(22, 22, 24, 0.92);
    color: #f6f3ec;
    font: 13px/1.5 -apple-system, BlinkMacSystemFont, sans-serif;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
    pointer-events: none;
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 160ms ease, transform 160ms ease;
  `;
  doc.body.appendChild(element);
  return element;
}

export class ReminderOverlay {
  private readonly element: HTMLDivElement;

  constructor(doc: Document) {
    this.element = ensureOverlayElement(doc);
  }

  show(message: string): void {
    this.element.textContent = message;
    this.element.style.opacity = '1';
    this.element.style.transform = 'translateY(0)';
  }

  hide(): void {
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(-8px)';
  }
}
