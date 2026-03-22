import { describe, expect, it } from 'vitest';

import { createEmptyStatsState, recordReadingSample, recordReminderTriggered } from '../shared/stats';
import type { ReminderSettings } from '../shared/types';
import { buildEyeCareReportModel, UNKNOWN_DOMAIN_LABEL } from './report-model';

const twentyRuleSettings: ReminderSettings = {
  reminderMode: 'twenty-twenty-twenty',
  reminderIntervalMinutes: 30,
  audioEnabled: true,
  fullscreenReminder: true
};

describe('buildEyeCareReportModel', () => {
  it('builds a zero-filled 7 day trend and computes totals with the fixed 20 minute rule', () => {
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-20',
      domain: 'weread.qq.com',
      bookTitle: '变量',
      readingTimeMs: 45 * 60_000
    });
    recordReminderTriggered(stats, {
      date: '2026-03-20',
      domain: 'weread.qq.com',
      bookTitle: '变量'
    });
    recordReadingSample(stats, {
      date: '2026-03-22',
      domain: 'example.com',
      readingTimeMs: 10 * 60_000
    });

    const report = buildEyeCareReportModel(stats, twentyRuleSettings, '2026-03-22', 7);

    expect(report.startDate).toBe('2026-03-16');
    expect(report.endDate).toBe('2026-03-22');
    expect(report.intervalMinutes).toBe(20);
    expect(report.totalReadingMinutes).toBe(55);
    expect(report.totalReminderCount).toBe(1);
    expect(report.expectedReminderCount).toBe(2);
    expect(report.complianceRate).toBe(0.5);
    expect(report.trend).toHaveLength(7);
    expect(report.trend[0]).toEqual({
      date: '2026-03-16',
      readingMinutes: 0,
      reminderCount: 0,
      expectedReminderCount: 0,
      complianceRate: null
    });
    expect(report.trend[4]).toEqual({
      date: '2026-03-20',
      readingMinutes: 45,
      reminderCount: 1,
      expectedReminderCount: 2,
      complianceRate: 0.5
    });
    expect(report.topDomain).toBe('weread.qq.com');
  });

  it('uses the configured standard interval when estimating compliance', () => {
    const stats = createEmptyStatsState();
    const standardSettings: ReminderSettings = {
      reminderMode: 'standard',
      reminderIntervalMinutes: 30,
      audioEnabled: true,
      fullscreenReminder: true
    };

    recordReadingSample(stats, {
      date: '2026-03-22',
      domain: 'example.com',
      readingTimeMs: 65 * 60_000
    });
    recordReminderTriggered(stats, {
      date: '2026-03-22',
      domain: 'example.com'
    });

    const report = buildEyeCareReportModel(stats, standardSettings, '2026-03-22', 7);

    expect(report.intervalMinutes).toBe(30);
    expect(report.expectedReminderCount).toBe(2);
    expect(report.complianceRate).toBe(0.5);
  });

  it('groups legacy book-only rows under an unknown domain bucket', () => {
    const stats = createEmptyStatsState();
    recordReadingSample(stats, {
      date: '2026-03-22',
      bookTitle: '旧数据',
      readingTimeMs: 25 * 60_000
    });

    const report = buildEyeCareReportModel(stats, twentyRuleSettings, '2026-03-22', 7);

    expect(report.domains).toEqual([
      {
        domain: UNKNOWN_DOMAIN_LABEL,
        readingMinutes: 25,
        reminderCount: 0,
        readingShare: 1
      }
    ]);
    expect(report.topDomain).toBe(UNKNOWN_DOMAIN_LABEL);
  });
});
