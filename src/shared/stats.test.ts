import { createEmptyStatsState, recordReadingSample, recordReminderTriggered } from './stats';

describe('stats aggregation', () => {
  it('aggregates daily and per-book reading samples without camera-era metrics', () => {
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
