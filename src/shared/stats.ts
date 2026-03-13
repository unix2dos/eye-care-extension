import type { BookStats, DayStats, ReminderOutcome, ReadingSample, StatsState } from './types';

function createBookStats(title: string): BookStats {
  return {
    title,
    readingTimeMs: 0,
    reminderCount: 0,
    blinkRateSampleSum: 0,
    blinkRateSampleCount: 0,
    averageBlinkRatePerMinute: null,
    recoverySuccessCount: 0,
    recoveryTimeMsSum: 0,
    recoverySampleCount: 0,
    averageRecoveryTimeMs: null
  };
}

function createDayStats(date: string): DayStats {
  return {
    date,
    readingTimeMs: 0,
    reminderCount: 0,
    blinkRateSampleSum: 0,
    blinkRateSampleCount: 0,
    averageBlinkRatePerMinute: null,
    lowBlinkDurationMs: 0,
    recoverySuccessCount: 0,
    recoveryTimeMsSum: 0,
    recoverySampleCount: 0,
    averageRecoveryTimeMs: null,
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

function updateBlinkRateAverage(target: DayStats | BookStats, blinkRatePerMinute: number | null): void {
  if (blinkRatePerMinute === null) {
    return;
  }

  target.blinkRateSampleSum += blinkRatePerMinute;
  target.blinkRateSampleCount += 1;
  target.averageBlinkRatePerMinute = target.blinkRateSampleSum / target.blinkRateSampleCount;
}

function updateRecoveryAverage(target: DayStats | BookStats, recoveryTimeMs: number, recovered: boolean): void {
  if (!recovered) {
    return;
  }

  target.recoverySuccessCount += 1;
  target.recoveryTimeMsSum += recoveryTimeMs;
  target.recoverySampleCount += 1;
  target.averageRecoveryTimeMs = target.recoveryTimeMsSum / target.recoverySampleCount;
}

export function createEmptyStatsState(): StatsState {
  return { days: {} };
}

export function recordReadingSample(state: StatsState, sample: ReadingSample): void {
  const day = ensureDay(state, sample.date);
  const book = ensureBook(day, sample.bookTitle);

  day.readingTimeMs += sample.readingTimeMs;
  day.lowBlinkDurationMs += sample.lowBlinkDurationMs;
  book.readingTimeMs += sample.readingTimeMs;

  updateBlinkRateAverage(day, sample.blinkRatePerMinute);
  updateBlinkRateAverage(book, sample.blinkRatePerMinute);
}

export function recordReminderTriggered(
  state: StatsState,
  reminder: Pick<ReminderOutcome, 'date' | 'bookTitle'>
): void {
  const day = ensureDay(state, reminder.date);
  const book = ensureBook(day, reminder.bookTitle);

  day.reminderCount += 1;
  book.reminderCount += 1;
}

export function recordReminderRecovery(state: StatsState, outcome: ReminderOutcome): void {
  const day = ensureDay(state, outcome.date);
  const book = ensureBook(day, outcome.bookTitle);

  updateRecoveryAverage(day, outcome.recoveryTimeMs, outcome.recovered);
  updateRecoveryAverage(book, outcome.recoveryTimeMs, outcome.recovered);
}

export function recordReminderOutcome(state: StatsState, outcome: ReminderOutcome): void {
  recordReminderTriggered(state, outcome);
  recordReminderRecovery(state, outcome);
}
