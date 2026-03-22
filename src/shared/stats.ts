import type { BookStats, DayStats, DomainStats, ReadingSample, StatsState } from './types';

export const CURRENT_STATS_SCHEMA_VERSION = 2;

function createBookStats(title: string, domain: string | null = null): BookStats {
  return {
    title,
    domain,
    readingTimeMs: 0,
    reminderCount: 0
  };
}

function createDomainStats(domain: string): DomainStats {
  return {
    domain,
    readingTimeMs: 0,
    reminderCount: 0
  };
}

function createDayStats(date: string): DayStats {
  return {
    date,
    readingTimeMs: 0,
    reminderCount: 0,
    books: {},
    domains: {}
  };
}

function ensureDay(state: StatsState, date: string): DayStats {
  const existing = state.days[date];
  if (existing) {
    return existing;
  }

  const created = createDayStats(date);
  state.days[date] = created;
  return created;
}

function ensureBook(day: DayStats, bookTitle: string, domain: string | null = null): BookStats {
  const existing = day.books[bookTitle];
  if (existing) {
    if (domain && !existing.domain) {
      existing.domain = domain;
    }
    return existing;
  }

  const created = createBookStats(bookTitle, domain);
  day.books[bookTitle] = created;
  return created;
}

function ensureDomain(day: DayStats, domain: string): DomainStats {
  const existing = day.domains[domain];
  if (existing) {
    return existing;
  }

  const created = createDomainStats(domain);
  day.domains[domain] = created;
  return created;
}

export function createEmptyStatsState(): StatsState {
  return {
    schemaVersion: CURRENT_STATS_SCHEMA_VERSION,
    days: {}
  };
}

export function recordReadingSample(state: StatsState, sample: ReadingSample): void {
  const day = ensureDay(state, sample.date);

  day.readingTimeMs += sample.readingTimeMs;

  if (sample.domain) {
    const domain = ensureDomain(day, sample.domain);
    domain.readingTimeMs += sample.readingTimeMs;
  }

  if (sample.bookTitle) {
    const book = ensureBook(day, sample.bookTitle, sample.domain ?? null);
    book.readingTimeMs += sample.readingTimeMs;
  }
}

export function recordReminderTriggered(
  state: StatsState,
  reminder: { date: string; domain?: string | null; bookTitle?: string | null }
): void {
  const day = ensureDay(state, reminder.date);

  day.reminderCount += 1;

  if (reminder.domain) {
    const domain = ensureDomain(day, reminder.domain);
    domain.reminderCount += 1;
  }

  if (reminder.bookTitle) {
    const book = ensureBook(day, reminder.bookTitle, reminder.domain ?? null);
    book.reminderCount += 1;
  }
}

function normalizeBookStats(bookTitle: string, book: unknown): BookStats {
  if (!book || typeof book !== 'object') {
    return createBookStats(bookTitle);
  }

  const raw = book as Partial<BookStats>;

  return {
    title: typeof raw.title === 'string' ? raw.title : bookTitle,
    domain: typeof raw.domain === 'string' ? raw.domain : null,
    readingTimeMs: typeof raw.readingTimeMs === 'number' ? raw.readingTimeMs : 0,
    reminderCount: typeof raw.reminderCount === 'number' ? raw.reminderCount : 0
  };
}

function normalizeDomainStats(domain: string, stats: unknown): DomainStats {
  if (!stats || typeof stats !== 'object') {
    return createDomainStats(domain);
  }

  const raw = stats as Partial<DomainStats>;

  return {
    domain: typeof raw.domain === 'string' ? raw.domain : domain,
    readingTimeMs: typeof raw.readingTimeMs === 'number' ? raw.readingTimeMs : 0,
    reminderCount: typeof raw.reminderCount === 'number' ? raw.reminderCount : 0
  };
}

function normalizeDayStats(date: string, day: unknown): DayStats {
  if (!day || typeof day !== 'object') {
    return createDayStats(date);
  }

  const raw = day as Partial<DayStats> & {
    books?: Record<string, unknown>;
    domains?: Record<string, unknown>;
  };
  const books = Object.fromEntries(
    Object.entries(raw.books ?? {}).map(([bookTitle, book]) => [bookTitle, normalizeBookStats(bookTitle, book)])
  );
  const domains = Object.fromEntries(
    Object.entries(raw.domains ?? {}).map(([domain, stats]) => [domain, normalizeDomainStats(domain, stats)])
  );

  return {
    date: typeof raw.date === 'string' ? raw.date : date,
    readingTimeMs: typeof raw.readingTimeMs === 'number' ? raw.readingTimeMs : 0,
    reminderCount: typeof raw.reminderCount === 'number' ? raw.reminderCount : 0,
    books,
    domains
  };
}

export function normalizeStatsState(state: unknown): StatsState {
  if (!state || typeof state !== 'object') {
    return createEmptyStatsState();
  }

  const raw = state as { days?: Record<string, unknown> };

  return {
    schemaVersion: CURRENT_STATS_SCHEMA_VERSION,
    days: Object.fromEntries(Object.entries(raw.days ?? {}).map(([date, day]) => [date, normalizeDayStats(date, day)]))
  };
}

export const DEFAULT_STATS_RETENTION_DAYS = 90;

export function trimOldDays(state: StatsState, retentionDays: number = DEFAULT_STATS_RETENTION_DAYS, today?: string): StatsState {
  const todayDate = today ?? new Date().toISOString().slice(0, 10);
  const cutoff = new Date(todayDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const trimmedDays = Object.fromEntries(
    Object.entries(state.days).filter(([date]) => date >= cutoffDate)
  );

  return {
    ...state,
    days: trimmedDays
  };
}
