import { describe, expect, it, vi } from 'vitest';

import type { EyeCareReportModel } from './report-model';
import { buildReportPdfFilename, exportEyeCareReportPdf, type PdfDocLike } from './report-pdf';

function createPdfDocStub() {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const record = (method: string, ...args: unknown[]) => {
    calls.push({ method, args });
  };

  const doc: PdfDocLike = {
    internal: {
      pageSize: {
        getWidth: () => 595,
        getHeight: () => 842
      }
    },
    addPage: vi.fn(() => record('addPage')),
    addFileToVFS: vi.fn((...args: Parameters<PdfDocLike['addFileToVFS']>) => {
      record('addFileToVFS', ...args);
      return doc;
    }),
    line: vi.fn((...args: Parameters<PdfDocLike['line']>) => record('line', ...args)),
    rect: vi.fn((...args: Parameters<PdfDocLike['rect']>) => record('rect', ...args)),
    save: vi.fn((...args: Parameters<PdfDocLike['save']>) => record('save', ...args)),
    addFont: vi.fn((...args: Parameters<PdfDocLike['addFont']>) => {
      record('addFont', ...args);
      return doc;
    }),
    setDrawColor: vi.fn((...args: Parameters<PdfDocLike['setDrawColor']>) => record('setDrawColor', ...args)),
    setFillColor: vi.fn((...args: Parameters<PdfDocLike['setFillColor']>) => record('setFillColor', ...args)),
    setFont: vi.fn((...args: Parameters<PdfDocLike['setFont']>) => {
      record('setFont', ...args);
      return doc;
    }),
    setFontSize: vi.fn((...args: Parameters<PdfDocLike['setFontSize']>) => record('setFontSize', ...args)),
    setTextColor: vi.fn((...args: Parameters<PdfDocLike['setTextColor']>) => record('setTextColor', ...args)),
    text: vi.fn((...args: Parameters<PdfDocLike['text']>) => record('text', ...args))
  };

  return { doc, calls };
}

const report: EyeCareReportModel = {
  rangeDays: 7,
  startDate: '2026-03-16',
  endDate: '2026-03-22',
  intervalMinutes: 20,
  totalReadingMinutes: 80,
  totalReminderCount: 3,
  expectedReminderCount: 4,
  complianceRate: 0.75,
  averageDailyReadingMinutes: 11,
  topDomain: 'weread.qq.com',
  trend: [
    { date: '2026-03-16', readingMinutes: 0, reminderCount: 0, expectedReminderCount: 0, complianceRate: null },
    { date: '2026-03-17', readingMinutes: 20, reminderCount: 1, expectedReminderCount: 1, complianceRate: 1 },
    { date: '2026-03-18', readingMinutes: 0, reminderCount: 0, expectedReminderCount: 0, complianceRate: null },
    { date: '2026-03-19', readingMinutes: 10, reminderCount: 0, expectedReminderCount: 0, complianceRate: null },
    { date: '2026-03-20', readingMinutes: 25, reminderCount: 1, expectedReminderCount: 1, complianceRate: 1 },
    { date: '2026-03-21', readingMinutes: 15, reminderCount: 0, expectedReminderCount: 0, complianceRate: null },
    { date: '2026-03-22', readingMinutes: 10, reminderCount: 1, expectedReminderCount: 1, complianceRate: 1 }
  ],
  domains: [
    { domain: 'weread.qq.com', readingMinutes: 60, reminderCount: 2, readingShare: 0.75 },
    { domain: 'example.com', readingMinutes: 20, reminderCount: 1, readingShare: 0.25 }
  ],
  isEmpty: false
};

describe('report pdf export', () => {
  it('builds a stable report filename', () => {
    expect(buildReportPdfFilename('2026-03-22', 30)).toBe('eye-care-report-30d-2026-03-22.pdf');
  });

  it('writes the report summary and saves the pdf', async () => {
    const { doc, calls } = createPdfDocStub();

    const filename = await exportEyeCareReportPdf(report, {
      createDoc: () => doc,
      loadFontBinaryString: async () => 'font-binary'
    });

    expect(filename).toBe('eye-care-report-7d-2026-03-22.pdf');
    expect(calls.some((call) => call.method === 'addFileToVFS' && call.args[0] === 'fonts/report-zh.ttf')).toBe(true);
    expect(calls.some((call) => call.method === 'text' && call.args[0] === '护眼健康报告')).toBe(true);
    expect(calls.some((call) => call.method === 'text' && String(call.args[0]).includes('总阅读：80 分钟'))).toBe(true);
    expect(calls.some((call) => call.method === 'text' && call.args[0] === '站点分布')).toBe(true);
    expect(calls.some((call) => call.method === 'save' && call.args[0] === filename)).toBe(true);
  });

  it('exports an empty-state report page when there is no data', async () => {
    const { doc, calls } = createPdfDocStub();
    const emptyReport = {
      ...report,
      totalReadingMinutes: 0,
      totalReminderCount: 0,
      expectedReminderCount: 0,
      complianceRate: null,
      averageDailyReadingMinutes: 0,
      topDomain: null,
      domains: [],
      trend: report.trend.map((point) => ({ ...point, readingMinutes: 0, reminderCount: 0, expectedReminderCount: 0, complianceRate: null })),
      isEmpty: true
    } satisfies EyeCareReportModel;

    await exportEyeCareReportPdf(emptyReport, {
      createDoc: () => doc,
      loadFontBinaryString: async () => 'font-binary'
    });

    expect(calls.some((call) => call.method === 'text' && String(call.args[0]).includes('当前范围暂无阅读数据'))).toBe(true);
    expect(calls.some((call) => call.method === 'save')).toBe(true);
  });
});
