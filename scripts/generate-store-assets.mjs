import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(rootDir, '..');
const storeDir = path.join(projectDir, 'docs', 'store');
const fixturesDir = path.join(storeDir, 'fixtures');
const imagesDir = path.join(storeDir, 'images');
const chromeBinary =
  process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const locales = {
  zh: {
    lang: 'zh-CN',
    screenshotPrefix: 'zh',
    brand: '微信读书护眼',
    eyebrow: '微信读书专用护眼提醒扩展',
    popupTitle: '微信读书护眼',
    popupSubtitle: '微信读书阅读提醒',
    popupMetrics: [
      ['今日阅读', '37 分钟'],
      ['今日提醒', '2 次'],
      ['阅读状态', '计时中 · 4分10秒'],
      ['下次提醒', '15分48秒后']
    ],
    popupButtons: ['预览提醒', '提醒设置'],
    optionsTitle: '微信读书护眼扩展',
    optionsIntro: '扩展只按你的活跃阅读时长提醒。',
    optionsMetrics: [
      ['今日阅读', '37 分钟'],
      ['今日提醒', '2 次'],
      ['阅读状态', '计时中 · 4分10秒'],
      ['下次提醒', '15分48秒后']
    ],
    settingsTitle: '提醒设置',
    settingsRows: [
      ['提醒间隔', '20 分钟'],
      ['播放提醒语音', '已开启'],
      ['使用全屏提醒', '已开启']
    ],
    settingsButtons: ['导出 CSV', '清空本地统计'],
    reminderBookTitle: '《示例阅读项目》',
    reminderBody: '当活跃阅读累计达到提醒间隔时，页面会立刻被提醒遮罩覆盖。',
    reminderMessage: '请休息一下，眨眼几次，再看远处十秒。',
    reminderButton: '我知道了',
    toolbarLabels: {
      active: '读',
      paused: '停',
      activeCaption: '正在计时',
      pausedCaption: '已暂停'
    },
    screens: {
      popup: {
        badge: '弹窗总览',
        title: '打开弹窗，马上看到阅读节奏',
        subtitle: '今日阅读、当前计时和下次提醒倒计时都集中在一个轻量面板里。',
        bullets: ['秒级刷新状态', '随手预览提醒效果', '一键进入设置页']
      },
      options: {
        badge: '设置页',
        title: '把提醒节奏调到顺手',
        subtitle: '提醒间隔、语音开关和全屏提醒都能在设置页直接调整。',
        bullets: ['15 / 20 / 30 分钟', '固定语音开关', '全屏或紧凑提醒']
      },
      reminder: {
        badge: '全屏提醒',
        title: '到点后直接打断阅读，提醒你休息',
        subtitle: '提醒不会自动消失，必须手动确认后才会恢复页面交互。',
        bullets: ['全屏遮罩', '固定语音提醒', '不需要额外权限']
      },
      toolbar: {
        badge: '工具栏状态',
        title: '不用打开弹窗，也知道现在是在读还是已停',
        subtitle: '当前活动标签页处于阅读中时显示“读”，暂停时显示“停”。',
        bullets: ['当前标签页驱动', '状态一眼可见', '和弹窗状态保持一致']
      }
    }
  },
  en: {
    lang: 'en',
    screenshotPrefix: 'en',
    brand: 'WeRead Eye Care',
    eyebrow: 'Break reminders built for WeRead Web',
    popupTitle: 'WeRead Eye Care',
    popupSubtitle: 'WeRead reading reminders',
    popupMetrics: [
      ['Today Reading', '37 min'],
      ['Today Breaks', '2'],
      ['Status', 'Reading · 4m 10s'],
      ['Next Break', '15m 48s']
    ],
    popupButtons: ['Preview', 'Settings'],
    optionsTitle: 'WeRead Eye Care',
    optionsIntro: 'Breaks are based on your active reading time.',
    optionsMetrics: [
      ['Today Reading', '37 min'],
      ['Today Breaks', '2'],
      ['Status', 'Reading · 4m 10s'],
      ['Next Break', '15m 48s']
    ],
    settingsTitle: 'Reminder Settings',
    settingsRows: [
      ['Interval', '20 min'],
      ['Voice Reminder', 'On'],
      ['Full-screen Reminder', 'On']
    ],
    settingsButtons: ['Export CSV', 'Reset Local Data'],
    reminderBookTitle: '"Example Reading Project"',
    reminderBody: 'When active reading reaches your break interval, the page is covered immediately.',
    reminderMessage: 'Take a short break, blink a few times, and look into the distance for ten seconds.',
    reminderButton: 'Got it',
    toolbarLabels: {
      active: 'READ',
      paused: 'PAUSE',
      activeCaption: 'Live reading',
      pausedCaption: 'Paused'
    },
    screens: {
      popup: {
        badge: 'Popup Overview',
        title: 'Open the popup and read the room instantly',
        subtitle: 'See today’s reading time, the live session timer, and your next break countdown in one glance.',
        bullets: ['Live seconds', 'Reminder preview', 'Direct settings shortcut']
      },
      options: {
        badge: 'Settings',
        title: 'Tune the reminder flow to your own pace',
        subtitle: 'Adjust the interval, voice playback, and full-screen reminders without leaving the extension.',
        bullets: ['15 / 20 / 30 minutes', 'Built-in voice toggle', 'Full-screen or compact mode']
      },
      reminder: {
        badge: 'Full-screen Reminder',
        title: 'A break overlay that is hard to ignore',
        subtitle: 'The reminder covers the page until you acknowledge it, so the break actually happens.',
        bullets: ['Page-blocking overlay', 'Bundled voice reminder', 'No extra permissions']
      },
      toolbar: {
        badge: 'Toolbar Badge',
        title: 'Know whether you are reading or paused without opening the popup',
        subtitle: 'The active tab shows a green READ badge while counting and a gray PAUSE badge when it stops.',
        bullets: ['Active tab aware', 'At-a-glance state', 'Matches popup status']
      }
    }
  }
};

const screenOrder = ['popup', 'options', 'reminder', 'toolbar'];

const commonStyles = `
  * { box-sizing: border-box; }
  html, body {
    width: 1280px;
    height: 800px;
    margin: 0;
    overflow: hidden;
    background: #f7f1e7;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
    color: #201914;
  }
  body {
    background:
      radial-gradient(circle at top left, rgba(233, 139, 86, 0.14), transparent 32%),
      radial-gradient(circle at top right, rgba(83, 144, 114, 0.18), transparent 30%),
      linear-gradient(180deg, #f7f1e7 0%, #fffaf2 100%);
  }
  .canvas {
    width: 1280px;
    height: 800px;
    padding: 52px 56px;
    display: grid;
    grid-template-columns: 1.02fr 0.98fr;
    gap: 36px;
  }
  .story {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
  }
  .eyebrow {
    display: inline-flex;
    width: fit-content;
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(45, 106, 79, 0.12);
    color: #2d6a4f;
    font-size: 16px;
    font-weight: 700;
  }
  h1 {
    margin: 0;
    font-size: 54px;
    line-height: 1.08;
    letter-spacing: -0.03em;
  }
  .subtitle {
    max-width: 520px;
    font-size: 24px;
    line-height: 1.5;
    color: #5f5143;
  }
  .bullets {
    display: grid;
    gap: 12px;
    margin-top: 6px;
  }
  .bullet {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    color: #3c342b;
  }
  .bullet::before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #2d6a4f;
    flex: 0 0 auto;
  }
  .visual-shell {
    align-self: center;
    width: 100%;
    min-height: 680px;
    border-radius: 34px;
    padding: 22px;
    background: rgba(255, 255, 255, 0.68);
    box-shadow: 0 24px 70px rgba(125, 96, 56, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.55);
  }
  .panel-card {
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 16px 50px rgba(124, 95, 57, 0.13);
    padding: 24px;
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .metric {
    border-radius: 18px;
    background: #fff7ec;
    padding: 16px;
  }
  .metric-label {
    font-size: 17px;
    color: #5b4d41;
    margin-bottom: 8px;
  }
  .metric-value {
    font-size: 30px;
    font-weight: 800;
    line-height: 1.18;
    color: #201914;
  }
  .button-stack {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }
  .button-pill {
    border-radius: 999px;
    background: #2d6a4f;
    color: #fff;
    text-align: center;
    padding: 14px 18px;
    font-size: 20px;
    font-weight: 700;
  }
  .button-pill.secondary {
    background: #517c67;
  }
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin: 22px 0 18px;
  }
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-radius: 18px;
    background: #fff8ee;
    padding: 16px 18px;
    font-size: 20px;
  }
  .setting-value {
    color: #2d6a4f;
    font-weight: 800;
  }
  .browser {
    border-radius: 30px;
    overflow: hidden;
    background: #fffdf8;
    box-shadow: 0 22px 60px rgba(111, 85, 47, 0.16);
    border: 1px solid rgba(255,255,255,0.6);
  }
  .browser-top {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    background: #f3eee6;
    border-bottom: 1px solid rgba(43,34,22,0.08);
  }
  .dot-row {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #d8cdbb;
  }
  .address-bar {
    flex: 1;
    height: 40px;
    border-radius: 999px;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 18px;
    font-size: 17px;
    color: #8c7f70;
  }
  .page {
    padding: 38px 42px 48px;
    min-height: 560px;
    background:
      linear-gradient(180deg, rgba(250,245,237,0.92), rgba(250,245,237,0.98)),
      linear-gradient(120deg, #f1e7d8, #fbf8f2);
  }
  .page-badge {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(233, 139, 86, 0.12);
    color: #7a4a2c;
    font-size: 14px;
    font-weight: 700;
  }
  .page-title {
    margin: 18px 0 16px;
    font-size: 42px;
    line-height: 1.18;
    letter-spacing: -0.02em;
  }
  .page-copy {
    font-size: 21px;
    line-height: 1.8;
    color: #4b4035;
  }
  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 16, 19, 0.94);
    padding: 32px;
  }
  .overlay-card {
    width: min(560px, 100%);
    border-radius: 24px;
    background: #f7f1e7;
    color: #1d1c19;
    padding: 34px 28px;
    text-align: center;
    box-shadow: 0 30px 80px rgba(0,0,0,0.32);
  }
  .overlay-title {
    font-size: 30px;
    line-height: 1.45;
    font-weight: 800;
    margin-bottom: 24px;
  }
  .overlay-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 190px;
    border-radius: 999px;
    background: #1d1c19;
    color: #f7f1e7;
    padding: 14px 22px;
    font-size: 19px;
    font-weight: 700;
  }
  .toolbar-frame {
    border-radius: 28px;
    overflow: hidden;
    background: #fbfaf7;
    box-shadow: 0 22px 60px rgba(111, 85, 47, 0.16);
  }
  .toolbar-top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    background: #f2ede5;
    border-bottom: 1px solid rgba(43,34,22,0.08);
  }
  .toolbar-icons {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
  }
  .tiny-icon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    background: #e6ddd0;
  }
  .action-icon {
    position: relative;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: linear-gradient(180deg, #fff6e5, #f8e2bc);
    border: 1px solid rgba(116, 88, 53, 0.18);
    display: grid;
    place-items: center;
    box-shadow: 0 12px 24px rgba(113, 87, 48, 0.14);
  }
  .action-eye {
    width: 20px;
    height: 14px;
    border-radius: 999px;
    background: #20313d;
    position: relative;
  }
  .action-eye::before {
    content: "";
    position: absolute;
    inset: 3px 5px;
    border-radius: 999px;
    background: #fff8ee;
  }
  .action-eye::after {
    content: "";
    position: absolute;
    inset: 5px 8px;
    border-radius: 999px;
    background: #20313d;
  }
  .badge-chip {
    position: absolute;
    right: -8px;
    bottom: -8px;
    min-width: 28px;
    height: 22px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    font-size: 11px;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 8px 16px rgba(0,0,0,0.18);
  }
  .toolbar-legend {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 26px;
  }
  .legend-card {
    border-radius: 20px;
    background: #fff8ee;
    padding: 18px;
  }
  .legend-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
  }
  .legend-badge {
    min-width: 58px;
    height: 30px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
  }
  .legend-title {
    font-size: 22px;
    font-weight: 800;
  }
  .legend-copy {
    font-size: 18px;
    color: #5c4e40;
    line-height: 1.6;
  }
`;

function renderStory(localeConfig, screenKey) {
  const screen = localeConfig.screens[screenKey];

  return `
    <section class="story">
      <div class="eyebrow">${screen.badge}</div>
      <h1>${screen.title}</h1>
      <div class="subtitle">${screen.subtitle}</div>
      <div class="bullets">
        ${screen.bullets.map((bullet) => `<div class="bullet">${bullet}</div>`).join('')}
      </div>
    </section>
  `;
}

function renderPopupVisual(localeConfig) {
  return `
    <section class="visual-shell">
      <div class="panel-card" style="max-width: 460px; margin: 0 auto;">
        <div style="font-size: 32px; font-weight: 800; margin-bottom: 10px;">${localeConfig.popupTitle}</div>
        <div style="font-size: 20px; color: #5b4d41;">${localeConfig.popupSubtitle}</div>
        <div class="metrics">
          ${localeConfig.popupMetrics
            .map(
              ([label, value]) => `
                <div class="metric">
                  <div class="metric-label">${label}</div>
                  <div class="metric-value">${value}</div>
                </div>
              `
            )
            .join('')}
        </div>
        <div class="button-stack">
          <div class="button-pill">${localeConfig.popupButtons[0]}</div>
          <div class="button-pill secondary">${localeConfig.popupButtons[1]}</div>
        </div>
      </div>
    </section>
  `;
}

function renderOptionsVisual(localeConfig) {
  return `
    <section class="visual-shell">
      <div class="panel-card">
        <div style="font-size: 34px; font-weight: 800; margin-bottom: 8px;">${localeConfig.optionsTitle}</div>
        <div style="font-size: 20px; color: #5b4d41;">${localeConfig.optionsIntro}</div>
        <div class="metrics">
          ${localeConfig.optionsMetrics
            .map(
              ([label, value]) => `
                <div class="metric">
                  <div class="metric-label">${label}</div>
                  <div class="metric-value">${value}</div>
                </div>
              `
            )
            .join('')}
        </div>
        <div style="font-size: 24px; font-weight: 800; margin: 8px 0 12px;">${localeConfig.settingsTitle}</div>
        <div class="settings-grid">
          ${localeConfig.settingsRows
            .map(
              ([label, value]) => `
                <div class="setting-row">
                  <span>${label}</span>
                  <span class="setting-value">${value}</span>
                </div>
              `
            )
            .join('')}
        </div>
        <div style="display: flex; gap: 12px; margin-top: 22px;">
          <div class="button-pill" style="flex: 1;">${localeConfig.settingsButtons[0]}</div>
          <div class="button-pill secondary" style="flex: 1; background: #b45a5a;">${localeConfig.settingsButtons[1]}</div>
        </div>
      </div>
    </section>
  `;
}

function renderReminderVisual(localeConfig) {
  return `
    <section class="visual-shell" style="padding: 0; overflow: hidden; position: relative;">
      <div class="browser">
        <div class="browser-top">
          <div class="dot-row">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="address-bar">https://weread.qq.com/web/reader/active-reading</div>
        </div>
        <div class="page">
          <div class="page-badge">${localeConfig.eyebrow}</div>
          <div class="page-title">${localeConfig.reminderBookTitle}</div>
          <div class="page-copy">${localeConfig.reminderBody}</div>
        </div>
      </div>
      <div class="overlay">
        <div class="overlay-card">
          <div class="overlay-title">${localeConfig.reminderMessage}</div>
          <div class="overlay-button">${localeConfig.reminderButton}</div>
        </div>
      </div>
    </section>
  `;
}

function renderToolbarVisual(localeConfig) {
  return `
    <section class="visual-shell">
      <div class="toolbar-frame">
        <div class="toolbar-top">
          <div class="dot-row">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="address-bar">https://weread.qq.com/web/reader/toolbar-badge</div>
          <div class="toolbar-icons">
            <div class="tiny-icon"></div>
            <div class="tiny-icon"></div>
            <div class="action-icon">
              <div class="action-eye"></div>
              <div class="badge-chip" style="background: #2D6A4F;">${localeConfig.toolbarLabels.active}</div>
            </div>
            <div class="tiny-icon"></div>
          </div>
        </div>
        <div style="padding: 28px 28px 30px;">
          <div class="toolbar-legend">
            <div class="legend-card">
              <div class="legend-head">
                <span class="legend-badge" style="background: #2D6A4F;">${localeConfig.toolbarLabels.active}</span>
                <span class="legend-title">${localeConfig.toolbarLabels.activeCaption}</span>
              </div>
              <div class="legend-copy">${
                localeConfig.lang === 'zh-CN'
                  ? '当前活动标签页正在计时，提醒会继续朝下一个倒计时节点推进。'
                  : 'The active WeRead tab is counting right now, so the next break countdown keeps moving.'
              }</div>
            </div>
            <div class="legend-card">
              <div class="legend-head">
                <span class="legend-badge" style="background: #8B8478;">${localeConfig.toolbarLabels.paused}</span>
                <span class="legend-title">${localeConfig.toolbarLabels.pausedCaption}</span>
              </div>
              <div class="legend-copy">${
                localeConfig.lang === 'zh-CN'
                  ? '切走页面、停止操作或离开微信读书时，工具栏会立刻显示暂停状态。'
                  : 'When you switch tabs, stop interacting, or leave WeRead, the toolbar immediately shows a paused state.'
              }</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderVisual(localeConfig, screenKey) {
  switch (screenKey) {
    case 'popup':
      return renderPopupVisual(localeConfig);
    case 'options':
      return renderOptionsVisual(localeConfig);
    case 'reminder':
      return renderReminderVisual(localeConfig);
    case 'toolbar':
      return renderToolbarVisual(localeConfig);
    default:
      throw new Error(`Unknown screen: ${screenKey}`);
  }
}

function buildHtml(localeKey, screenKey) {
  const localeConfig = locales[localeKey];
  const screen = localeConfig.screens[screenKey];

  return `<!doctype html>
<html lang="${localeConfig.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1280, initial-scale=1.0" />
    <title>${localeConfig.brand} - ${screen.badge}</title>
    <style>${commonStyles}</style>
  </head>
  <body>
    <main class="canvas">
      ${renderStory(localeConfig, screenKey)}
      ${renderVisual(localeConfig, screenKey)}
    </main>
  </body>
</html>`;
}

async function ensureCleanDir(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

function captureScreenshot(htmlPath, pngPath) {
  execFileSync(chromeBinary, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--window-size=1280,800',
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`
  ]);
}

await ensureCleanDir(fixturesDir);
await ensureCleanDir(imagesDir);

for (const localeKey of Object.keys(locales)) {
  const localeFixtureDir = path.join(fixturesDir, localeKey);
  const localeImageDir = path.join(imagesDir, localeKey);

  await mkdir(localeFixtureDir, { recursive: true });
  await mkdir(localeImageDir, { recursive: true });

  for (const [index, screenKey] of screenOrder.entries()) {
    const html = buildHtml(localeKey, screenKey);
    const fileBase = `${String(index + 1).padStart(2, '0')}-${screenKey}`;
    const htmlPath = path.join(localeFixtureDir, `${fileBase}.html`);
    const pngPath = path.join(localeImageDir, `${fileBase}.png`);

    await writeFile(htmlPath, html, 'utf8');
    captureScreenshot(htmlPath, pngPath);
  }
}

console.info(`Generated store fixtures in ${fixturesDir}`);
console.info(`Generated store images in ${imagesDir}`);
