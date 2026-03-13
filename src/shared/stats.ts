import type { BookStats, DayStats, ReadingSample, StatsState } from './types';

function createBookStats(title: string): BookStats {
  return {
    title,
    readingTimeMs: 0,
    reminderCount: 0
  };
}

function createDayStats(date: string): DayStats {
  return {
    date,
    readingTimeMs: 0,
    reminderCount: 0,
    books: {}
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

function ensureBook(day: DayStats, bookTitle: string): BookStats {
  const existing = day.books[bookTitle];
  if (existing) {
    return existing;
  }

  const created = createBookStats(bookTitle);
  day.books[bookTitle] = created;
  return created;
}

export function createEmptyStatsState(): StatsState {
  return { days: {} };
}

export function recordReadingSample(state: StatsState, sample: ReadingSample): void {
  const day = ensureDay(state, sample.date);
  const book = ensureBook(day, sample.bookTitle);

  day.readingTimeMs += sample.readingTimeMs;
  book.readingTimeMs += sample.readingTimeMs;
}

export function recordReminderTriggered(state: StatsState, reminder: { date: string; bookTitle: string }): void {
  const day = ensureDay(state, reminder.date);
  const book = ensureBook(day, reminder.bookTitle);

  day.reminderCount += 1;
  book.reminderCount += 1;
}

function normalizeBookStats(bookTitle: string, book: unknown): BookStats {
  if (!book || typeof book !== 'object') {
    return createBookStats(bookTitle);
  }

  const raw = book as Partial<BookStats>;

  return {
    title: typeof raw.title === 'string' ? raw.title : bookTitle,
    readingTimeMs: typeof raw.readingTimeMs === 'number' ? raw.readingTimeMs : 0,
    reminderCount: typeof raw.reminderCount === 'number' ? raw.reminderCount : 0
  };
}

function normalizeDayStats(date: string, day: unknown): DayStats {
  if (!day || typeof day !== 'object') {
    return createDayStats(date);
  }

  const raw = day as Partial<DayStats> & { books?: Record<string, unknown> };
  const books = Object.fromEntries(
    Object.entries(raw.books ?? {}).map(([bookTitle, book]) => [bookTitle, normalizeBookStats(bookTitle, book)])
  );

  return {
    date: typeof raw.date === 'string' ? raw.date : date,
    readingTimeMs: typeof raw.readingTimeMs === 'number' ? raw.readingTimeMs : 0,
    reminderCount: typeof raw.reminderCount === 'number' ? raw.reminderCount : 0,
    books
  };
}

export function normalizeStatsState(state: unknown): StatsState {
  if (!state || typeof state !== 'object') {
    return createEmptyStatsState();
  }

  const raw = state as { days?: Record<string, unknown> };

  return {
    days: Object.fromEntries(Object.entries(raw.days ?? {}).map(([date, day]) => [date, normalizeDayStats(date, day)]))
  };
}
