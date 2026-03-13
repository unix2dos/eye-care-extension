export interface ReminderScheduleStatus {
  activeReadingTimeMs: number;
  reminderDue: boolean;
  nextReminderAt: number | null;
  isActive: boolean;
}

export class ActiveReadingReminderScheduler {
  private accumulatedActiveReadingMs: number;
  private lastUpdatedAt: number | null = null;
  private wasActive = false;

  constructor(
    private readonly reminderIntervalMs: number,
    initialActiveReadingTimeMs = 0
  ) {
    this.accumulatedActiveReadingMs = initialActiveReadingTimeMs;
  }

  update(now: number, isActive: boolean): ReminderScheduleStatus {
    if (this.lastUpdatedAt !== null && this.wasActive && isActive) {
      this.accumulatedActiveReadingMs += Math.max(0, now - this.lastUpdatedAt);
    }

    this.lastUpdatedAt = now;
    this.wasActive = isActive;

    const reminderDue = this.accumulatedActiveReadingMs >= this.reminderIntervalMs;

    return {
      activeReadingTimeMs: this.accumulatedActiveReadingMs,
      reminderDue,
      nextReminderAt: isActive
        ? now + Math.max(0, this.reminderIntervalMs - this.accumulatedActiveReadingMs)
        : null,
      isActive
    };
  }

  markReminderTriggered(now: number): void {
    this.accumulatedActiveReadingMs = 0;
    this.lastUpdatedAt = now;
  }
}
