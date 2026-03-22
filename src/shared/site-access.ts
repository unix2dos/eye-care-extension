import { isSupportedWeReadUrl } from '../content/weread/adapter';

export const OPTIONAL_HOST_PERMISSION_PATTERNS = ['http://*/*', 'https://*/*'] as const;
export const DEFAULT_HOST_PERMISSION_PATTERNS = ['https://weread.qq.com/*'] as const;

export interface TabSiteAccessState {
  hasAccess: boolean;
  isInjectable: boolean;
  isWeRead: boolean;
  originPattern: string | null;
}

type PermissionsContains = (permissions: chrome.permissions.Permissions) => Promise<boolean>;
type BrowserTabLike = Pick<chrome.tabs.Tab, 'url'> | null | undefined;

function getPermissionsContains(): PermissionsContains {
  return chrome.permissions.contains.bind(chrome.permissions);
}

function parseUrl(urlValue: string | null | undefined): URL | null {
  if (typeof urlValue !== 'string') {
    return null;
  }

  try {
    return new URL(urlValue);
  } catch {
    return null;
  }
}

export function isInjectableUrl(url: URL): boolean {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

export function buildOriginPermissionPattern(url: URL): string | null {
  if (!isInjectableUrl(url)) {
    return null;
  }

  return `${url.protocol}//${url.host}/*`;
}

export async function resolveSiteAccessForUrl(
  urlValue: string | null | undefined,
  contains?: PermissionsContains
): Promise<TabSiteAccessState> {
  const url = parseUrl(urlValue);

  if (!url) {
    return {
      hasAccess: false,
      isInjectable: false,
      isWeRead: false,
      originPattern: null
    };
  }

  const isWeRead = isSupportedWeReadUrl(url);
  const originPattern = buildOriginPermissionPattern(url);
  const isInjectable = originPattern !== null;

  if (!isInjectable) {
    return {
      hasAccess: false,
      isInjectable: false,
      isWeRead,
      originPattern: null
    };
  }

  if (isWeRead) {
    return {
      hasAccess: true,
      isInjectable: true,
      isWeRead: true,
      originPattern
    };
  }

  const hasAccess = await (contains ?? getPermissionsContains())({
    origins: [originPattern]
  });

  return {
    hasAccess,
    isInjectable: true,
    isWeRead: false,
    originPattern
  };
}

export async function resolveTabSiteAccess(
  tab: BrowserTabLike,
  contains?: PermissionsContains
): Promise<TabSiteAccessState> {
  return resolveSiteAccessForUrl(tab?.url, contains);
}

export async function hasSiteAccess(urlValue: string | null | undefined, contains?: PermissionsContains): Promise<boolean> {
  const access = await resolveSiteAccessForUrl(urlValue, contains);
  return access.hasAccess;
}
