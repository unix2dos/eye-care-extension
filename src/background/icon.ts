export type ToolbarIconState = 'active' | 'paused';

export interface ToolbarIconTheme {
  backgroundStart: string;
  backgroundEnd: string;
  leafStart: string;
  leafEnd: string;
  accent: string;
}

export interface ToolbarBadgeTheme {
  text: '读' | '停';
  backgroundColor: string;
  textColor: string;
}

const THEMES: Record<ToolbarIconState, ToolbarIconTheme> = {
  active: {
    backgroundStart: '#9EDB8A',
    backgroundEnd: '#2D6A4F',
    leafStart: '#E6F6D8',
    leafEnd: '#C8E7AD',
    accent: '#F7FFF0'
  },
  paused: {
    backgroundStart: '#D5CFC3',
    backgroundEnd: '#8B8478',
    leafStart: '#F2EEE7',
    leafEnd: '#D9D1C5',
    accent: '#FFF8EE'
  }
};

const BADGE_THEMES: Record<ToolbarIconState, ToolbarBadgeTheme> = {
  active: {
    text: '读',
    backgroundColor: '#2D6A4F',
    textColor: '#FFFFFF'
  },
  paused: {
    text: '停',
    backgroundColor: '#8B8478',
    textColor: '#FFFFFF'
  }
};

export function getToolbarIconState({
  isSupportedPage,
  isActiveReading
}: {
  isSupportedPage: boolean;
  isActiveReading: boolean;
}): ToolbarIconState {
  return isSupportedPage && isActiveReading ? 'active' : 'paused';
}

export function buildToolbarIconSvg(state: ToolbarIconState): string {
  const theme = THEMES[state];

  return `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="16" y1="12" x2="112" y2="116" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.backgroundStart}"/>
      <stop offset="1" stop-color="${theme.backgroundEnd}"/>
    </linearGradient>
    <linearGradient id="leaf" x1="63" y1="46" x2="84" y2="68" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.leafStart}"/>
      <stop offset="1" stop-color="${theme.leafEnd}"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="112" height="112" rx="28" fill="url(#bg)"/>
  <path
    d="M22 64C29.2 47.2 45.6 36 64 36C82.4 36 98.8 47.2 106 64C98.8 80.8 82.4 92 64 92C45.6 92 29.2 80.8 22 64Z"
    fill="${theme.accent}"
  />
  <path
    d="M28 64C34 50.8 47.8 42 64 42C80.2 42 94 50.8 100 64C94 77.2 80.2 86 64 86C47.8 86 34 77.2 28 64Z"
    fill="#1C2C3B"
  />
  <circle cx="64" cy="64" r="15" fill="${theme.accent}"/>
  <circle cx="64" cy="64" r="8" fill="#1C2C3B"/>
  <path
    d="M72 42C82 41.6 90.4 49.1 90.8 59.1C80.9 59.5 72.4 52 72 42Z"
    fill="url(#leaf)"
  />
  <path
    d="M74.5 45.5C79.4 48.9 83 53.3 85.4 58.7"
    stroke="#EAF7DA"
    stroke-width="3"
    stroke-linecap="round"
  />
  <circle cx="48" cy="55" r="4" fill="${theme.accent}" fill-opacity="0.9"/>
</svg>`;
}

export function buildToolbarBadge(state: ToolbarIconState): ToolbarBadgeTheme {
  return BADGE_THEMES[state];
}
