import { getWeReadBookTitle, isSupportedWeReadUrl } from './adapter';

describe('isSupportedWeReadUrl', () => {
  it('accepts WeRead reader pages', () => {
    expect(isSupportedWeReadUrl(new URL('https://weread.qq.com/web/reader/123456'))).toBe(true);
  });

  it('rejects non-reader pages', () => {
    expect(isSupportedWeReadUrl(new URL('https://weread.qq.com/web/shelf'))).toBe(false);
  });
});

describe('getWeReadBookTitle', () => {
  it('prefers the reader title element', () => {
    document.body.innerHTML = '<div class="readerTopBar_title_txt">变量</div>';
    document.title = '忽略我 - 微信读书';

    expect(getWeReadBookTitle(document)).toBe('变量');
  });

  it('falls back to document title', () => {
    document.body.innerHTML = '';
    document.title = '纳瓦尔宝典 - 微信读书';

    expect(getWeReadBookTitle(document)).toBe('纳瓦尔宝典');
  });
});
