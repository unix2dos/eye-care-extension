export interface ReminderPolicyConfig {
  inactivityTimeoutMs: number;
  reminderIntervalMs: number;
}

export interface ReminderSettings {
  reminderIntervalMinutes: 15 | 20 | 30;
  audioEnabled: boolean;
  fullscreenReminder: boolean;
}

export interface RuntimeStatusSnapshot {
  isSupportedPage: boolean;
  isDocumentVisible: boolean;
  isActiveReading: boolean;
  lastInteractionAt: number | null;
  activeReadingTimeMs: number;
  nextEligibleReminderAt: number | null;
  inactivityTimeoutMs: number;
}

export interface ReadingSample {
  date: string;
  domain?: string | null;
  bookTitle?: string | null;
  readingTimeMs: number;
}

export interface BookStats {
  title: string;
  domain: string | null;
  readingTimeMs: number;
  reminderCount: number;
}

export interface DomainStats {
  domain: string;
  readingTimeMs: number;
  reminderCount: number;
}

export interface DayStats {
  date: string;
  readingTimeMs: number;
  reminderCount: number;
  books: Record<string, BookStats>;
  domains: Record<string, DomainStats>;
}

export interface StatsState {
  schemaVersion: number;
  days: Record<string, DayStats>;
}

export interface PersistedState {
  stats: StatsState;
  activeReadingTimeMs: number;
  isActiveReading: boolean;
  nextEligibleReminderAt: number | null;
  settings: ReminderSettings;
}

export interface StorageAreaLike {
  get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}
