import { describe, expect, it } from 'vitest';

import { exportBookStatsCsv } from './csv';
import { createEmptyStatsState, recordReadingSample, recordReminderTriggered } from './stats';

describe('exportBookStatsCsv', () => {
  it('exports the reminder stats with domain context', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-14',
      domain: 'weread.qq.com',
      bookTitle: '群居的艺术',
      readingTimeMs: 300_000
    });
    recordReminderTriggered(state, {
      date: '2026-03-14',
      domain: 'weread.qq.com',
      bookTitle: '群居的艺术'
    });

    const csv = exportBookStatsCsv(state);
    const [header, row] = csv.trim().split('\n');

    expect(header).toBe('date,domain,bookTitle,readingMinutes,reminderCount');
    expect(row).toBe('2026-03-14,weread.qq.com,群居的艺术,5,1');
  });

  it('exports domain-only rows for non-WeRead sites', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-14',
      domain: 'example.com',
      readingTimeMs: 60_000
    });

    const csv = exportBookStatsCsv(state);
    const [, row] = csv.trim().split('\n');

    expect(row).toBe('2026-03-14,example.com,,1,0');
  });

  it('escapes book titles that contain commas', () => {
    const state = createEmptyStatsState();

    recordReadingSample(state, {
      date: '2026-03-14',
      domain: 'weread.qq.com',
      bookTitle: 'A,B',
      readingTimeMs: 60_000
    });

    const csv = exportBookStatsCsv(state);
    const [, row] = csv.trim().split('\n');

    expect(row).toBe('2026-03-14,weread.qq.com,"A,B",1,0');
  });
});
