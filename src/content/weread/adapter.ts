const WEREAD_READER_PATH = '/web/reader/';

const TITLE_SELECTORS = ['.readerTopBar_title_txt', '.readerCatalog_bookInfo_title'];

export function isSupportedWeReadUrl(url: URL): boolean {
  return url.hostname === 'weread.qq.com' && url.pathname.startsWith(WEREAD_READER_PATH);
}

function cleanDocumentTitle(title: string): string {
  return title.replace(/\s*-\s*微信读书$/, '').trim();
}

export function getWeReadBookTitle(doc: Document): string {
  for (const selector of TITLE_SELECTORS) {
    const element = doc.querySelector<HTMLElement>(selector);
    const text = element?.textContent?.trim() ?? element?.innerText?.trim();
    if (text) {
      return text;
    }
  }

  return cleanDocumentTitle(doc.title) || '未命名书籍';
}
