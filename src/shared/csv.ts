import type { BookStats, DayStats, StatsState } from './types';

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[,"\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function exportBookStatsCsv(state: StatsState): string {
  const header = ['date', 'domain', 'bookTitle', 'readingMinutes', 'reminderCount'];

  const rows = Object.values(state.days)
    .sort((left, right) => left.date.localeCompare(right.date))
    .flatMap((day) => buildCsvRowsForDay(day));

  return [header.join(','), ...rows].join('\n');
}

function compareBookRows(left: BookStats, right: BookStats): number {
  const domainCompare = (left.domain ?? '').localeCompare(right.domain ?? '');
  if (domainCompare !== 0) {
    return domainCompare;
  }

  return left.title.localeCompare(right.title);
}

function buildCsvRowsForDay(day: DayStats): string[] {
  const bookRows = Object.values(day.books)
    .sort(compareBookRows)
    .map((book) =>
      [day.date, book.domain ?? '', book.title, Math.round(book.readingTimeMs / 60_000), book.reminderCount]
        .map(escapeCsvValue)
        .join(',')
    );

  const domainsCoveredByBooks = new Set(
    Object.values(day.books)
      .map((book) => book.domain)
      .filter((domain): domain is string => typeof domain === 'string' && domain.length > 0)
  );

  const domainOnlyRows = Object.values(day.domains)
    .filter((domain) => !domainsCoveredByBooks.has(domain.domain))
    .sort((left, right) => left.domain.localeCompare(right.domain))
    .map((domain) =>
      [day.date, domain.domain, '', Math.round(domain.readingTimeMs / 60_000), domain.reminderCount]
        .map(escapeCsvValue)
        .join(',')
    );

  return [...bookRows, ...domainOnlyRows];
}
