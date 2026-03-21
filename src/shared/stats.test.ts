import { createEmptyStatsState, recordReadingSample, recordReminderTriggered, trimOldDays } from './stats';

describe('stats aggregation', () => {
  it('aggregates daily and per-book reading samples with the current minimal stats model', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '刘擎西方现代思想讲义',
      readingTimeMs: 120_000
    });

    recordReadingSample(state, {
      date: '2026-03-13',
      bookTitle: '刘擎西方现代思想讲义',
      readingTimeMs: 60_000
    });

    expect(state.days['2026-03-13']).toEqual({
      date: '2026-03-13',
      readingTimeMs: 180_000,
      reminderCount: 0,
      books: {
        刘擎西方现代思想讲义: {
          title: '刘擎西方现代思想讲义',
          readingTimeMs: 180_000,
          reminderCount: 0
        }
      }
    });
  });

  it('records reminder counts without recovery bookkeeping', () => {
    const state = createEmptyStatsState();

    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '置身事内'
    });

    recordReminderTriggered(state, {
      date: '2026-03-13',
      bookTitle: '置身事内'
    });

    expect(state.days['2026-03-13']).toEqual({
      date: '2026-03-13',
      readingTimeMs: 0,
      reminderCount: 2,
      books: {
        置身事内: {
          title: '置身事内',
          readingTimeMs: 0,
          reminderCount: 2
        }
      }
    });
  });
});

describe('trimOldDays', () => {
  it('keeps days within retention and removes days beyond it', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, { date: '2025-12-01', bookTitle: 'old', readingTimeMs: 60_000 });
    recordReadingSample(state, { date: '2026-03-20', bookTitle: 'recent', readingTimeMs: 60_000 });
    recordReadingSample(state, { date: '2026-03-22', bookTitle: 'today', readingTimeMs: 60_000 });

    const trimmed = trimOldDays(state, 90, '2026-03-22');

    expect(trimmed.days['2025-12-01']).toBeUndefined();
    expect(trimmed.days['2026-03-20']).toBeDefined();
    expect(trimmed.days['2026-03-22']).toBeDefined();
  });

  it('returns empty days for empty stats', () => {
    const trimmed = trimOldDays(createEmptyStatsState(), 90, '2026-03-22');

    expect(trimmed).toEqual({ days: {} });
  });
});
