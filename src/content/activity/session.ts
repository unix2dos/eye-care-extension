export class ActiveReadingSession {
  private isVisible = true;
  private activeSince: number | null = null;
  private lastInteractionAt: number | null = null;

  constructor(private readonly inactivityTimeoutMs: number) {}

  markInteraction(now: number): void {
    if (!this.isVisible) {
      return;
    }

    if (this.activeSince === null) {
      this.activeSince = now;
    }

    this.lastInteractionAt = now;
  }

  setVisibility(isVisible: boolean, _now: number): void {
    this.isVisible = isVisible;

    if (!isVisible) {
      this.activeSince = null;
      this.lastInteractionAt = null;
    }
  }

  isActive(now: number): boolean {
    return this.isVisible && this.lastInteractionAt !== null && now - this.lastInteractionAt <= this.inactivityTimeoutMs;
  }

  getActiveReadingSince(now: number): number | null {
    return this.isActive(now) ? this.activeSince : null;
  }
}
