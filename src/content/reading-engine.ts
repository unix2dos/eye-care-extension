import { recordReadingSample as recordSample, recordReminderTriggered as recordReminder } from '../shared/stats';
import type { PersistedState, StatsState } from '../shared/types';
import type { ActiveReadingSession } from './activity/session';
import type { ReminderAudioDebugInfo } from './reminder/audio';
import type { ReminderOverlayPresentation } from './reminder/overlay';
import type { ActiveReadingReminderScheduler, ReminderScheduleStatus } from './runtime/scheduler';

export interface ReadingEngineDeps {
  session: ActiveReadingSession;
  scheduler: ActiveReadingReminderScheduler;
  storage: {
    setRuntimeStatus(status: Partial<Pick<PersistedState, 'activeReadingTimeMs' | 'isActiveReading' | 'nextEligibleReminderAt'>>): Promise<void>;
    saveStats(stats: StatsState): Promise<void>;
  };
  overlay: {
    show(
      message: string,
      mode: 'reminder',
      presentation: ReminderOverlayPresentation,
      countdownSeconds?: number
    ): Promise<void>;
    isBlockingReminderVisible(): boolean;
  };
  playReminder: () => Promise<ReminderAudioDebugInfo>;
  recordReminderAudioDebug: (info: ReminderAudioDebugInfo) => void;
  reportToolbarIconState: (isActiveReading: boolean) => Promise<void>;
  getDomain: () => string | null;
  getBookTitle: () => string | null;
  getReminderIntervalMs: () => number;
  getReminderPresentation: () => ReminderOverlayPresentation;
  getReminderMessage: () => string;
  getReminderCountdownSeconds: () => number | null;
  isAudioEnabled: () => boolean;
  doc: Pick<Document, 'visibilityState'>;
}

const STATS_SAMPLE_INTERVAL_MS = 5_000;

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export class ReadingEngine {
  private stats: StatsState;
  private activeReadingTimeMs: number;
  private isActiveReading: boolean;
  private nextEligibleReminderAt: number | null;

  constructor(
    private readonly deps: ReadingEngineDeps,
    initialState: {
      stats: StatsState;
      activeReadingTimeMs: number;
      isActiveReading: boolean;
      nextEligibleReminderAt: number | null;
    }
  ) {
    this.stats = initialState.stats;
    this.activeReadingTimeMs = initialState.activeReadingTimeMs;
    this.isActiveReading = initialState.isActiveReading;
    this.nextEligibleReminderAt = initialState.nextEligibleReminderAt;
  }

  private async persistRuntimeStatus(
    nextStatus: Partial<Pick<PersistedState, 'activeReadingTimeMs' | 'isActiveReading' | 'nextEligibleReminderAt'>>
  ): Promise<void> {
    const nextActiveReadingTimeMs = nextStatus.activeReadingTimeMs ?? this.activeReadingTimeMs;
    const nextIsActiveReading = nextStatus.isActiveReading ?? this.isActiveReading;
    const nextReminderAt =
      nextStatus.nextEligibleReminderAt === undefined ? this.nextEligibleReminderAt : nextStatus.nextEligibleReminderAt;

    if (
      nextActiveReadingTimeMs === this.activeReadingTimeMs &&
      nextIsActiveReading === this.isActiveReading &&
      nextReminderAt === this.nextEligibleReminderAt
    ) {
      return;
    }

    const shouldReportToolbarState = nextIsActiveReading !== this.isActiveReading;

    this.activeReadingTimeMs = nextActiveReadingTimeMs;
    this.isActiveReading = nextIsActiveReading;
    this.nextEligibleReminderAt = nextReminderAt;

    await this.deps.storage.setRuntimeStatus({
      activeReadingTimeMs: this.activeReadingTimeMs,
      isActiveReading: this.isActiveReading,
      nextEligibleReminderAt: this.nextEligibleReminderAt
    });

    if (shouldReportToolbarState) {
      await this.deps.reportToolbarIconState(this.isActiveReading);
    }
  }

  async syncSchedule(now: number): Promise<ReminderScheduleStatus> {
    const schedule = this.deps.scheduler.update(now, this.deps.session.isActive(now));
    await this.persistRuntimeStatus({
      activeReadingTimeMs: schedule.activeReadingTimeMs,
      isActiveReading: schedule.isActive,
      nextEligibleReminderAt: schedule.isActive ? schedule.nextReminderAt : null
    });
    return schedule;
  }

  async tick(now: number): Promise<void> {
    if (this.deps.overlay.isBlockingReminderVisible()) {
      await this.persistRuntimeStatus({
        isActiveReading: false,
        nextEligibleReminderAt: null
      });
      return;
    }

    const schedule = await this.syncSchedule(now);

    if (!schedule.isActive) {
      return;
    }

    this.recordReadingSample(STATS_SAMPLE_INTERVAL_MS);
    await this.deps.storage.saveStats(this.stats);

    if (!schedule.reminderDue) {
      return;
    }

    this.recordReminderTriggered();
    await this.deps.storage.saveStats(this.stats);

    this.deps.scheduler.markReminderTriggered(now);
    await this.persistRuntimeStatus({
      activeReadingTimeMs: 0,
      isActiveReading: true,
      nextEligibleReminderAt: now + this.deps.getReminderIntervalMs()
    });

    await this.triggerReminder();
  }

  private recordReadingSample(readingTimeMs: number): void {
    recordSample(this.stats, {
      date: getTodayDate(),
      domain: this.deps.getDomain(),
      bookTitle: this.deps.getBookTitle(),
      readingTimeMs
    });
  }

  private recordReminderTriggered(): void {
    recordReminder(this.stats, {
      date: getTodayDate(),
      domain: this.deps.getDomain(),
      bookTitle: this.deps.getBookTitle()
    });
  }

  private async triggerReminder(): Promise<void> {
    const dismissed = this.deps.overlay.show(
      this.deps.getReminderMessage(),
      'reminder',
      this.deps.getReminderPresentation(),
      this.deps.getReminderCountdownSeconds() ?? undefined
    );
    const debugInfo = this.deps.isAudioEnabled()
      ? await this.deps.playReminder()
      : { sourceUrl: '', playbackKind: 'bundled-audio' as const, status: 'disabled' as const, errorMessage: null };
    this.deps.recordReminderAudioDebug(debugInfo);
    await dismissed;
  }

  start(win: Window): void {
    win.setInterval(() => {
      void this.tick(Date.now());
    }, STATS_SAMPLE_INTERVAL_MS);
  }
}
