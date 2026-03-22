import { createEmptyStatsState, recordReadingSample, recordReminderTriggered, trimOldDays } from './stats';

describe('stats aggregation', () => {
  it('aggregates daily, per-book, and per-domain reading samples', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-13',
      domain: 'weread.qq.com',
      bookTitle: '刘擎西方现代思想讲义',
      readingTimeMs: 120_000
    });

    recordReadingSample(state, {
      date: '2026-03-13',
      domain: 'weread.qq.com',
      bookTitle: '刘擎西方现代思想讲义',
      readingTimeMs: 60_000
    });

    expect(state).toEqual({
      schemaVersion: 2,
      days: {
        '2026-03-13': {
          date: '2026-03-13',
          readingTimeMs: 180_000,
          reminderCount: 0,
          books: {
            刘擎西方现代思想讲义: {
              title: '刘擎西方现代思想讲义',
              domain: 'weread.qq.com',
              readingTimeMs: 180_000,
              reminderCount: 0
            }
          },
          domains: {
            'weread.qq.com': {
              domain: 'weread.qq.com',
              readingTimeMs: 180_000,
              reminderCount: 0
            }
          }
        }
      }
    });
  });

  it('records reminder counts without losing domain-only sites', () => {
    const state = createEmptyStatsState();

    recordReminderTriggered(state, {
      date: '2026-03-13',
      domain: 'docs.example.com'
    });

    recordReminderTriggered(state, {
      date: '2026-03-13',
      domain: 'weread.qq.com',
      bookTitle: '置身事内'
    });

    expect(state.days['2026-03-13']).toEqual({
      date: '2026-03-13',
      readingTimeMs: 0,
      reminderCount: 2,
      books: {
        置身事内: {
          title: '置身事内',
          domain: 'weread.qq.com',
          readingTimeMs: 0,
          reminderCount: 1
        }
      },
      domains: {
        'docs.example.com': {
          domain: 'docs.example.com',
          readingTimeMs: 0,
          reminderCount: 1
        },
        'weread.qq.com': {
          domain: 'weread.qq.com',
          readingTimeMs: 0,
          reminderCount: 1
        }
      }
    });
  });
});

describe('trimOldDays', () => {
  it('keeps days within retention and removes days beyond it', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, { date: '2025-12-01', domain: 'old.example.com', bookTitle: 'old', readingTimeMs: 60_000 });
    recordReadingSample(state, {
      date: '2026-03-20',
      domain: 'recent.example.com',
      bookTitle: 'recent',
      readingTimeMs: 60_000
    });
    recordReadingSample(state, { date: '2026-03-22', domain: 'today.example.com', bookTitle: 'today', readingTimeMs: 60_000 });

    const trimmed = trimOldDays(state, 90, '2026-03-22');

    expect(trimmed.days['2025-12-01']).toBeUndefined();
    expect(trimmed.days['2026-03-20']).toBeDefined();
    expect(trimmed.days['2026-03-22']).toBeDefined();
    expect(trimmed.schemaVersion).toBe(2);
  });

  it('returns empty days for empty stats', () => {
    const trimmed = trimOldDays(createEmptyStatsState(), 90, '2026-03-22');

    expect(trimmed).toEqual({
      schemaVersion: 2,
      days: {}
    });
  });
});
