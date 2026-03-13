export interface ReminderPolicyConfig {
  inactivityTimeoutMs: number;
  reminderIntervalMs: number;
}

export interface ReadingSample {
  date: string;
  bookTitle: string;
  readingTimeMs: number;
}

export interface BookStats {
  title: string;
  readingTimeMs: number;
  reminderCount: number;
}

export interface DayStats {
  date: string;
  readingTimeMs: number;
  reminderCount: number;
  books: Record<string, BookStats>;
}

export interface StatsState {
  days: Record<string, DayStats>;
}

export interface PersistedState {
  stats: StatsState;
  activeReadingTimeMs: number;
  isActiveReading: boolean;
  nextEligibleReminderAt: number | null;
}

export interface StorageAreaLike {
  get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}
