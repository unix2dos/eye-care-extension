import { DEFAULT_HOST_PERMISSION_PATTERNS, OPTIONAL_HOST_PERMISSION_PATTERNS } from '../shared/site-access';

export interface EnabledSite {
  origin: string;
  label: string;
}

type PermissionsGetAll = () => Promise<chrome.permissions.Permissions>;
type PermissionsRemove = (permissions: chrome.permissions.Permissions) => Promise<boolean>;

function stripPatternSuffix(origin: string): string {
  return origin.endsWith('/*') ? origin.slice(0, -1) : origin;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function isUserGrantedSiteOrigin(origin: string): boolean {
  if (!origin || DEFAULT_HOST_PERMISSION_PATTERNS.includes(origin as (typeof DEFAULT_HOST_PERMISSION_PATTERNS)[number])) {
    return false;
  }

  if (OPTIONAL_HOST_PERMISSION_PATTERNS.includes(origin as (typeof OPTIONAL_HOST_PERMISSION_PATTERNS)[number])) {
    return false;
  }

  try {
    const url = new URL(stripPatternSuffix(origin));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatEnabledSiteLabel(origin: string): string {
  try {
    return new URL(stripPatternSuffix(origin)).host;
  } catch {
    return origin;
  }
}

export function buildEnabledSites(origins: string[] | undefined): EnabledSite[] {
  return [...new Set(origins ?? [])]
    .filter(isUserGrantedSiteOrigin)
    .sort((left, right) => left.localeCompare(right))
    .map((origin) => ({
      origin,
      label: formatEnabledSiteLabel(origin)
    }));
}

export async function loadEnabledSites(getAll: PermissionsGetAll = chrome.permissions.getAll.bind(chrome.permissions)): Promise<EnabledSite[]> {
  const permissions = await getAll();
  return buildEnabledSites(permissions.origins);
}

export async function removeEnabledSite(
  origin: string,
  remove: PermissionsRemove = chrome.permissions.remove.bind(chrome.permissions)
): Promise<boolean> {
  return remove({ origins: [origin] });
}

export function buildEnabledSitesMarkup(enabledSites: EnabledSite[]): string {
  if (enabledSites.length === 0) {
    return '<p class="empty-state">暂时没有通过 popup 启用的站点。</p>';
  }

  return `
    <ul class="site-list">
      ${enabledSites
        .map(
          (site) => `
            <li class="site-row">
              <div class="site-meta">
                <strong>${escapeHtml(site.label)}</strong>
                <span class="site-origin">${escapeHtml(site.origin)}</span>
              </div>
              <button class="secondary site-remove" data-remove-origin="${escapeHtml(site.origin)}">移除</button>
            </li>
          `
        )
        .join('')}
    </ul>
  `;
}
