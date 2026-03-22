import { createBreakGuideState } from './break-guide';

const OVERLAY_ID = 'weread-eye-care-overlay';
const DISMISS_BUTTON_LABEL = '我知道了';

interface ReminderOverlayOptions {
  prefersReducedMotion?: () => boolean;
  supportsGuideAnimation?: () => boolean;
}

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
    <style>
      #${OVERLAY_ID} [data-role="guide-shell"] {
        display: grid;
        gap: 14px;
        margin-bottom: 20px;
      }

      #${OVERLAY_ID} [data-role="guide-visual"] {
        display: flex;
        justify-content: center;
      }

      #${OVERLAY_ID} [data-role="guide-svg"] {
        width: 100%;
        height: auto;
        overflow: visible;
      }

      #${OVERLAY_ID} [data-role="guide-ring"] {
        animation: weread-eye-care-breathe 4s ease-in-out infinite;
        transform-origin: center;
        transform-box: fill-box;
      }

      #${OVERLAY_ID} [data-guide-part="pupil"] {
        transition: transform 600ms ease;
        transform-box: fill-box;
      }

      #${OVERLAY_ID} [data-role="guide-copy"] {
        display: grid;
        gap: 6px;
        text-align: left;
      }

      #${OVERLAY_ID} [data-role="guide-title"] {
        font-size: 18px;
        font-weight: 700;
      }

      #${OVERLAY_ID} [data-role="guide-description"] {
        color: #6f6659;
        font-size: 14px;
      }

      #${OVERLAY_ID} [data-role="guide-steps"] {
        display: grid;
        gap: 8px;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      #${OVERLAY_ID} [data-role="guide-step"] {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border-radius: 14px;
        background: #fffaf3;
        border: 1px solid transparent;
        text-align: left;
      }

      #${OVERLAY_ID} [data-role="guide-step"][data-active="true"] {
        background: #eef7f0;
        border-color: rgba(45, 106, 79, 0.22);
      }

      #${OVERLAY_ID} [data-role="guide-step-index"] {
        display: inline-flex;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(45, 106, 79, 0.12);
        color: #2d6a4f;
        font-size: 12px;
        font-weight: 700;
      }

      #${OVERLAY_ID} [data-role="guide-step-copy"] {
        display: grid;
        gap: 2px;
      }

      #${OVERLAY_ID} [data-role="guide-step-copy"] strong {
        font-size: 14px;
      }

      #${OVERLAY_ID} [data-role="guide-step-copy"] span {
        color: #6f6659;
        font-size: 13px;
      }

      @keyframes weread-eye-care-breathe {
        0%, 100% {
          opacity: 0.28;
          transform: scale(0.95);
        }

        50% {
          opacity: 0.72;
          transform: scale(1.06);
        }
      }
    </style>
    <div
      data-role="panel"
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
          margin-bottom: 16px;
        "
      ></div>
      <div data-role="guide-shell">
        <div data-role="guide-visual" aria-hidden="true">
          <div data-role="guide-visual-frame" style="width: min(220px, 100%);">
            <svg data-role="guide-svg" viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg">
              <circle data-role="guide-ring" cx="110" cy="60" r="44" fill="none" stroke="rgba(45, 106, 79, 0.18)" stroke-width="10" />
              <ellipse cx="74" cy="58" rx="34" ry="24" fill="#fff" stroke="#c9b59a" stroke-width="3" />
              <ellipse cx="146" cy="58" rx="34" ry="24" fill="#fff" stroke="#c9b59a" stroke-width="3" />
              <circle data-role="guide-pupil-left" data-guide-part="pupil" cx="74" cy="58" r="8" fill="#1d1c19" />
              <circle data-role="guide-pupil-right" data-guide-part="pupil" cx="146" cy="58" r="8" fill="#1d1c19" />
              <path d="M42 34c10-12 22-18 32-18s22 6 32 18" fill="none" stroke="#d9c7af" stroke-width="4" stroke-linecap="round" />
              <path d="M114 34c10-12 22-18 32-18s22 6 32 18" fill="none" stroke="#d9c7af" stroke-width="4" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        <div data-role="guide-copy">
          <div data-role="guide-title"></div>
          <div data-role="guide-description"></div>
        </div>
        <ol data-role="guide-steps"></ol>
      </div>
      <div
        data-role="countdown"
        style="
          min-height: 24px;
          margin-bottom: 24px;
          color: #6f6659;
          font-size: 14px;
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
  private readonly prefersReducedMotion: () => boolean;
  private readonly supportsGuideAnimation: () => boolean;
  private readonly element: HTMLDivElement;
  private readonly panelElement: HTMLDivElement;
  private readonly messageElement: HTMLDivElement;
  private readonly guideVisualElement: HTMLDivElement;
  private readonly guideVisualFrameElement: HTMLDivElement;
  private readonly guideTitleElement: HTMLDivElement;
  private readonly guideDescriptionElement: HTMLDivElement;
  private readonly guideStepsElement: HTMLOListElement;
  private readonly leftPupilElement: SVGElement;
  private readonly rightPupilElement: SVGElement;
  private readonly guideRingElement: SVGElement;
  private readonly countdownElement: HTMLDivElement;
  private readonly dismissButton: HTMLButtonElement;
  private dismissPromise: Promise<void> | null = null;
  private resolveDismiss: (() => void) | null = null;
  private activeMode: ReminderOverlayMode | null = null;
  private activePresentation: ReminderOverlayPresentation | null = null;
  private previousHtmlOverflow = '';
  private previousBodyOverflow = '';
  private countdownIntervalId: number | null = null;

  constructor(doc: Document, { prefersReducedMotion, supportsGuideAnimation }: ReminderOverlayOptions = {}) {
    this.doc = doc;
    this.prefersReducedMotion =
      prefersReducedMotion ??
      (() => doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    this.supportsGuideAnimation = supportsGuideAnimation ?? (() => true);
    this.element = ensureOverlayElement(doc);
    const panelElement = this.element.querySelector('[data-role="panel"]');
    const messageElement = this.element.querySelector('[data-role="message"]');
    const guideVisualElement = this.element.querySelector('[data-role="guide-visual"]');
    const guideVisualFrameElement = this.element.querySelector('[data-role="guide-visual-frame"]');
    const guideTitleElement = this.element.querySelector('[data-role="guide-title"]');
    const guideDescriptionElement = this.element.querySelector('[data-role="guide-description"]');
    const guideStepsElement = this.element.querySelector('[data-role="guide-steps"]');
    const leftPupilElement = this.element.querySelector('[data-role="guide-pupil-left"]');
    const rightPupilElement = this.element.querySelector('[data-role="guide-pupil-right"]');
    const guideRingElement = this.element.querySelector('[data-role="guide-ring"]');
    const countdownElement = this.element.querySelector('[data-role="countdown"]');
    const dismissButton = this.element.querySelector('[data-role="dismiss"]');

    if (
      !(panelElement instanceof HTMLDivElement) ||
      !(messageElement instanceof HTMLDivElement) ||
      !(guideVisualElement instanceof HTMLDivElement) ||
      !(guideVisualFrameElement instanceof HTMLDivElement) ||
      !(guideTitleElement instanceof HTMLDivElement) ||
      !(guideDescriptionElement instanceof HTMLDivElement) ||
      !(guideStepsElement instanceof HTMLOListElement) ||
      !(leftPupilElement instanceof SVGElement) ||
      !(rightPupilElement instanceof SVGElement) ||
      !(guideRingElement instanceof SVGElement) ||
      !(countdownElement instanceof HTMLDivElement) ||
      !(dismissButton instanceof HTMLButtonElement)
    ) {
      throw new Error('Reminder overlay structure is incomplete.');
    }

    this.panelElement = panelElement;
    this.messageElement = messageElement;
    this.guideVisualElement = guideVisualElement;
    this.guideVisualFrameElement = guideVisualFrameElement;
    this.guideTitleElement = guideTitleElement;
    this.guideDescriptionElement = guideDescriptionElement;
    this.guideStepsElement = guideStepsElement;
    this.leftPupilElement = leftPupilElement;
    this.rightPupilElement = rightPupilElement;
    this.guideRingElement = guideRingElement;
    this.countdownElement = countdownElement;
    this.dismissButton = dismissButton;
    this.dismissButton.addEventListener('click', () => {
      if (this.dismissButton.disabled) {
        return;
      }
      this.hide();
    });
  }

  private clearCountdown(): void {
    if (this.countdownIntervalId !== null) {
      window.clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
  }

  private setGuidePupilOffset(offsetX: number, offsetY: number): void {
    const transform = `translate(${offsetX}px, ${offsetY}px)`;
    this.leftPupilElement.style.transform = transform;
    this.rightPupilElement.style.transform = transform;
  }

  private updateGuide(countdownTotalSeconds?: number, remainingSeconds?: number | null): void {
    const state = createBreakGuideState({
      countdownTotalSeconds,
      remainingSeconds,
      motionReduced: this.prefersReducedMotion() || !this.supportsGuideAnimation()
    });

    this.guideTitleElement.textContent = state.heading;
    this.guideDescriptionElement.textContent = state.description;
    this.guideVisualElement.style.display = state.motionReduced ? 'none' : 'flex';
    this.guideRingElement.style.animationPlayState = state.motionReduced ? 'paused' : 'running';

    const activeStep = state.steps[state.activeStepIndex];
    this.setGuidePupilOffset(
      state.motionReduced ? 0 : activeStep.pupilOffsetX,
      state.motionReduced ? 0 : activeStep.pupilOffsetY
    );

    this.guideStepsElement.innerHTML = state.steps
      .map(
        (step, index) => `
          <li data-role="guide-step" data-active="${index === state.activeStepIndex}">
            <span data-role="guide-step-index">${index + 1}</span>
            <span data-role="guide-step-copy">
              <strong>${step.title}</strong>
              <span>${step.description}</span>
            </span>
          </li>
        `
      )
      .join('');
  }

  private setDismissButtonEnabled(enabled: boolean): void {
    this.dismissButton.disabled = !enabled;
    this.dismissButton.style.opacity = enabled ? '1' : '0.56';
    this.dismissButton.style.cursor = enabled ? 'pointer' : 'not-allowed';

    if (enabled) {
      this.dismissButton.textContent = DISMISS_BUTTON_LABEL;
      this.dismissButton.focus();
    }
  }

  private applyCountdown(countdownSeconds?: number): void {
    this.clearCountdown();

    if (!countdownSeconds || countdownSeconds <= 0) {
      this.updateGuide();
      this.countdownElement.textContent = '';
      this.countdownElement.style.display = 'none';
      this.setDismissButtonEnabled(true);
      return;
    }

    const totalSeconds = Math.ceil(countdownSeconds);
    let remainingSeconds = totalSeconds;

    const updateCountdownUi = () => {
      this.countdownElement.style.display = 'block';
      this.countdownElement.textContent = `请先看远处 ${remainingSeconds} 秒`;
      this.dismissButton.textContent = `${remainingSeconds} 秒后可关闭`;
    };

    this.setDismissButtonEnabled(false);
    updateCountdownUi();
    this.updateGuide(totalSeconds, remainingSeconds);

    this.countdownIntervalId = window.setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds <= 0) {
        this.clearCountdown();
        this.countdownElement.textContent = '倒计时结束，可以关闭提醒。';
        this.updateGuide(totalSeconds, 0);
        this.setDismissButtonEnabled(true);
        return;
      }

      updateCountdownUi();
      this.updateGuide(totalSeconds, remainingSeconds);
    }, 1_000);
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
      this.guideVisualFrameElement.style.width = 'min(160px, 100%)';
      this.guideTitleElement.style.fontSize = '16px';
      this.guideDescriptionElement.style.fontSize = '13px';
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
    this.guideVisualFrameElement.style.width = 'min(220px, 100%)';
    this.guideTitleElement.style.fontSize = '18px';
    this.guideDescriptionElement.style.fontSize = '14px';
  }

  show(
    message: string,
    mode: ReminderOverlayMode = 'reminder',
    presentation: ReminderOverlayPresentation = 'fullscreen',
    countdownSeconds?: number
  ): Promise<void> {
    this.activeMode = mode;
    this.activePresentation = presentation;
    this.messageElement.textContent = message;
    this.applyPresentation(presentation);
    this.applyCountdown(countdownSeconds);

    if (presentation === 'fullscreen') {
      this.previousHtmlOverflow = this.doc.documentElement.style.overflow;
      this.previousBodyOverflow = this.doc.body.style.overflow;
      this.doc.documentElement.style.overflow = 'hidden';
      this.doc.body.style.overflow = 'hidden';
    }

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
    this.clearCountdown();
    this.element.style.display = 'none';
    this.doc.documentElement.style.overflow = this.previousHtmlOverflow;
    this.doc.body.style.overflow = this.previousBodyOverflow;
    this.updateGuide();
    this.countdownElement.textContent = '';
    this.countdownElement.style.display = 'none';
    this.setDismissButtonEnabled(true);

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
