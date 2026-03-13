// src/content/reminder/overlay.ts
var OVERLAY_ID = "weread-eye-care-overlay";
function ensureOverlayElement(doc) {
  const existing = doc.getElementById(OVERLAY_ID);
  if (existing instanceof HTMLDivElement) {
    return existing;
  }
  const element = doc.createElement("div");
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
var ReminderOverlay = class {
  element;
  constructor(doc) {
    this.element = ensureOverlayElement(doc);
  }
  show(message) {
    this.element.textContent = message;
    this.element.style.opacity = "1";
    this.element.style.transform = "translateY(0)";
  }
  hide() {
    this.element.style.opacity = "0";
    this.element.style.transform = "translateY(-8px)";
  }
};

// docs/screenshot-fixtures/reminder-overlay-entry.ts
var overlay = new ReminderOverlay(document);
overlay.show("\u8BF7\u8FDE\u7EED\u7728\u773C 3 \u6B21\uFF0C\u653E\u677E\u4E00\u4E0B\u773C\u775B\u3002");
