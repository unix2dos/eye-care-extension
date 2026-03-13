import type { StatsState } from './types';

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[,"\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function exportBookStatsCsv(state: StatsState): string {
  const header = ['date', 'bookTitle', 'readingMinutes', 'reminderCount'];

  const rows = Object.values(state.days)
    .sort((left, right) => left.date.localeCompare(right.date))
    .flatMap((day) =>
      Object.values(day.books)
        .sort((left, right) => left.title.localeCompare(right.title))
        .map((book) =>
          [day.date, book.title, Math.round(book.readingTimeMs / 60_000), book.reminderCount].map(escapeCsvValue).join(',')
        )
    );

  return [header.join(','), ...rows].join('\n');
}
