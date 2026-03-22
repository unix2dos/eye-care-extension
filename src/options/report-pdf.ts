import { jsPDF } from 'jspdf';

import type { EyeCareReportModel } from './report-model';

const PDF_FONT_FILE = 'fonts/report-zh.ttf';
const PDF_FONT_NAME = 'ReportZh';

interface PdfPageSizeLike {
  getWidth(): number;
  getHeight(): number;
}

export interface PdfDocLike {
  internal: { pageSize: PdfPageSizeLike };
  addPage(): void;
  addFileToVFS(filename: string, filecontent: string): PdfDocLike;
  line(x1: number, y1: number, x2: number, y2: number): void;
  rect(x: number, y: number, width: number, height: number, style?: string): void;
  save(filename: string): void;
  addFont(postScriptName: string, fontName: string, fontStyle: string): PdfDocLike;
  setDrawColor(r: number, g: number, b: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setFont(fontName: string, fontStyle?: string): PdfDocLike;
  setFontSize(size: number): void;
  setTextColor(r: number, g: number, b: number): void;
  text(text: string, x: number, y: number): void;
}

interface ReportPdfDeps {
  createDoc?: () => PdfDocLike;
  loadFontBinaryString?: () => Promise<string>;
}

let reportFontBinaryPromise: Promise<string> | null = null;

function arrayBufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    result += String.fromCharCode(...chunk);
  }

  return result;
}

async function loadBundledReportFontBinaryString(): Promise<string> {
  if (!reportFontBinaryPromise) {
    reportFontBinaryPromise = (async () => {
      const url = chrome.runtime.getURL(PDF_FONT_FILE);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load report font: ${response.status}`);
      }

      return arrayBufferToBinaryString(await response.arrayBuffer());
    })();
  }

  return reportFontBinaryPromise;
}

function formatPercent(value: number | null): string {
  return value === null ? '暂无' : `${Math.round(value * 100)}%`;
}

function drawSummary(doc: PdfDocLike, report: EyeCareReportModel, startY: number): number {
  doc.setFontSize(12);
  doc.setTextColor(70, 57, 43);
  doc.text(`时间范围：${report.startDate} 至 ${report.endDate}（${report.rangeDays} 天）`, 40, startY);
  doc.text(`提醒规则：每 ${report.intervalMinutes} 分钟`, 40, startY + 18);

  doc.setFontSize(14);
  doc.setTextColor(29, 28, 25);
  doc.text(`总阅读：${report.totalReadingMinutes} 分钟`, 40, startY + 48);
  doc.text(`提醒次数：${report.totalReminderCount} 次`, 40, startY + 70);
  doc.text(`应休息次数：${report.expectedReminderCount} 次`, 220, startY + 48);
  doc.text(`休息合规率：${formatPercent(report.complianceRate)}`, 220, startY + 70);
  doc.text(`日均阅读：${report.averageDailyReadingMinutes} 分钟`, 40, startY + 92);
  doc.text(`主要站点：${report.topDomain ?? '无'}`, 220, startY + 92);

  return startY + 120;
}

function drawTrendChart(doc: PdfDocLike, report: EyeCareReportModel, startY: number): number {
  const chartX = 40;
  const chartY = startY + 18;
  const chartWidth = doc.internal.pageSize.getWidth() - 80;
  const chartHeight = 120;
  const maxReadingMinutes = Math.max(...report.trend.map((point) => point.readingMinutes), 1);
  const barGap = 4;
  const barWidth = Math.max(4, (chartWidth - barGap * (report.trend.length - 1)) / report.trend.length);

  doc.setFontSize(14);
  doc.setTextColor(29, 28, 25);
  doc.text(`最近 ${report.rangeDays} 天趋势`, chartX, startY);
  doc.setDrawColor(213, 199, 180);
  doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight);

  report.trend.forEach((point, index) => {
    const x = chartX + index * (barWidth + barGap);
    const barHeight = Math.round((point.readingMinutes / maxReadingMinutes) * (chartHeight - 20));
    const y = chartY + chartHeight - barHeight;

    doc.setFillColor(45, 106, 79);
    doc.rect(x, y, barWidth, barHeight, 'F');

    if (report.trend.length <= 10 || index % Math.ceil(report.trend.length / 6) === 0 || index === report.trend.length - 1) {
      doc.setFontSize(8);
      doc.setTextColor(111, 91, 71);
      doc.text(point.date.slice(5), x, chartY + chartHeight + 12);
    }
  });

  return chartY + chartHeight + 28;
}

function drawDomains(doc: PdfDocLike, report: EyeCareReportModel, startY: number): void {
  doc.setFontSize(14);
  doc.setTextColor(29, 28, 25);
  doc.text('站点分布', 40, startY);

  if (report.domains.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(111, 91, 71);
    doc.text('当前范围暂无阅读数据。', 40, startY + 20);
    return;
  }

  report.domains.slice(0, 6).forEach((domain, index) => {
    const y = startY + 22 + index * 18;
    doc.setFontSize(11);
    doc.setTextColor(29, 28, 25);
    doc.text(domain.domain, 40, y);
    doc.setTextColor(111, 91, 71);
    doc.text(
      `${domain.readingMinutes} 分钟 | ${domain.reminderCount} 次提醒 | ${Math.round(domain.readingShare * 100)}%`,
      260,
      y
    );
  });
}

export function buildReportPdfFilename(endDate: string, rangeDays: number): string {
  return `eye-care-report-${rangeDays}d-${endDate}.pdf`;
}

export async function exportEyeCareReportPdf(
  report: EyeCareReportModel,
  {
    createDoc = () => new jsPDF({ unit: 'pt', format: 'a4' }) as unknown as PdfDocLike,
    loadFontBinaryString = loadBundledReportFontBinaryString
  }: ReportPdfDeps = {}
): Promise<string> {
  const doc = createDoc();
  const filename = buildReportPdfFilename(report.endDate, report.rangeDays);
  const fontBinaryString = await loadFontBinaryString();

  doc.addFileToVFS(PDF_FONT_FILE, fontBinaryString);
  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'normal');
  doc.setFont(PDF_FONT_NAME, 'normal');

  doc.setFontSize(20);
  doc.setTextColor(29, 28, 25);
  doc.text('护眼健康报告', 40, 40);

  if (report.isEmpty) {
    doc.setFontSize(12);
    doc.setTextColor(111, 91, 71);
    doc.text('当前范围暂无阅读数据。', 40, 70);
    doc.save(filename);
    return filename;
  }

  const afterSummaryY = drawSummary(doc, report, 72);
  const afterTrendY = drawTrendChart(doc, report, afterSummaryY);
  drawDomains(doc, report, afterTrendY + 8);
  doc.save(filename);

  return filename;
}
