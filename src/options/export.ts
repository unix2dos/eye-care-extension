interface DownloadCsvDeps {
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
  createElement?: (tagName: string) => HTMLAnchorElement;
  setTimeout?: typeof window.setTimeout;
}

export function buildExportFilename(date: string): string {
  return `weread-eye-care-${date}.csv`;
}

export function downloadCsv(
  filename: string,
  contents: string,
  {
    createObjectURL = URL.createObjectURL.bind(URL),
    revokeObjectURL = URL.revokeObjectURL.bind(URL),
    createElement = (tagName) => document.createElement(tagName) as HTMLAnchorElement,
    setTimeout = window.setTimeout.bind(window)
  }: DownloadCsvDeps = {}
): void {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8' });
  const url = createObjectURL(blob);
  const anchor = createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  setTimeout(() => {
    revokeObjectURL(url);
  }, 0);
}
