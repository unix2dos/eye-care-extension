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
    brand: '护眼提醒扩展',
    eyebrow: '本地优先护眼提醒',
    popupTitle: '护眼提醒扩展',
    popupSubtitle: '微信读书默认支持，普通网页按站点启用',
    popupMetrics: [
      ['今日阅读', '27 分钟'],
      ['今日提醒', '1 次'],
      ['阅读状态', '已暂停 · 9分40秒'],
      ['下次提醒', '等待开始阅读']
    ],
    popupButtons: ['预览提醒', '提醒设置'],
    popupSupportBadges: ['微信读书默认支持', '当前站点已启用'],
    popupStatusCopy: '只有页面可见、标签页在前台且仍有操作时，才继续累计活跃用眼时间。',
    optionsTitle: '护眼提醒扩展',
    optionsIntro: '按活跃用眼时间提醒休息，统计和报告只保存在当前浏览器本地。',
    optionsMetrics: [
      ['今日阅读', '27 分钟'],
      ['今日提醒', '1 次'],
      ['阅读状态', '已暂停 · 9分40秒'],
      ['下次提醒', '等待开始阅读']
    ],
    settingsTitle: '提醒设置',
    settingsRows: [
      ['提醒模式', '20-20-20'],
      ['标准提醒', '20 分钟'],
      ['播放提醒语音', '已开启'],
      ['使用全屏提醒', '已开启']
    ],
    reportTitle: '用眼健康报告',
    reportSummary: [
      ['总阅读', '27 分钟'],
      ['提醒次数', '1 次'],
      ['合规情况', '暂无'],
      ['范围', '最近 7 天']
    ],
    reportTrend: [
      ['03-21', '14 分钟', 0.72],
      ['03-22', '13 分钟', 0.66]
    ],
    siteDistributionTitle: '站点分布',
    siteDistribution: [
      ['未记录站点', '14 分钟 · 0 次提醒'],
      ['weread.qq.com', '12 分钟 · 1 次提醒']
    ],
    enabledSitesTitle: '已启用站点',
    enabledSites: ['weread.qq.com', 'sspai.com'],
    dataTitle: '数据管理',
    dataDescription: 'PDF 适合打印或分享；CSV 适合备份和自行分析原始统计数据。',
    dataButtons: ['导出报告 PDF', '导出原始数据 CSV', '清空本地数据'],
    reminderBookTitle: '护眼休息时间到了',
    reminderBody: '当前按 20-20-20 模式提醒：看向远处并跟着步骤放松 20 秒。',
    reminderMessage: '请看向 20 英尺外，至少 20 秒',
    reminderCountdown: '剩余 12 秒',
    reminderSteps: ['远眺屏幕外远处', '左右缓慢转动视线', '上下轻轻转动视线', '闭眼深呼吸一次'],
    reminderHint: '倒计时结束后才能关闭提醒',
    reminderButton: '等待倒计时结束',
    toolbarLabels: {
      active: '读',
      paused: '停',
      activeCaption: '正在计时',
      pausedCaption: '已暂停'
    },
    toolbarAddress: 'https://sspai.com/post/active-reading',
    toolbarCopyActive: '当前标签页已启用且仍在活跃阅读，工具栏会保持“读”状态并继续推进下次提醒。',
    toolbarCopyPaused: '切走标签页、停止操作，或当前站点未启用时，工具栏会立即显示“停”。',
    screens: {
      popup: {
        badge: '弹窗总览',
        title: '默认支持微信读书，也能按站点扩展到普通网页',
        subtitle: '今日阅读、状态解释和下次提醒都集中在一个轻量面板里。',
        bullets: ['当前站点一键启用', '支持提醒预览', '暂停原因直接可见']
      },
      options: {
        badge: '设置页',
        title: '把设置、报告和数据管理分成清晰层级',
        subtitle: '首屏先处理提醒设置和健康报告，数据管理与高级信息放到下面。',
        bullets: ['20-20-20 / 标准提醒', '报告与数据导出分区', '已启用站点可管理']
      },
      reminder: {
        badge: '全屏提醒',
        title: '20-20-20 会带着你完成一个真正的短休息',
        subtitle: '倒计时结束前不能关闭，并按步骤提示远眺、转动视线和呼吸放松。',
        bullets: ['20 秒倒计时', '休息引导步骤', 'reduced-motion 可退化']
      },
      toolbar: {
        badge: '工具栏状态',
        title: '不用打开弹窗，也知道当前标签页是否还在计时',
        subtitle: '已启用站点活跃阅读时显示“读”，暂停或未计时时显示“停”。',
        bullets: ['当前标签页驱动', '读 / 停 一眼可见', '和弹窗状态保持一致']
      }
    }
  },
  en: {
    lang: 'en',
    screenshotPrefix: 'en',
    brand: 'Eye Care Reminder',
    eyebrow: 'Local-first eye care reminder',
    popupTitle: 'Eye Care Reminder',
    popupSubtitle: 'WeRead by default, other sites one by one',
    popupMetrics: [
      ['Today Reading', '27 min'],
      ['Today Breaks', '1'],
      ['Status', 'Paused · 9m 40s'],
      ['Next Break', 'Waiting for reading']
    ],
    popupButtons: ['Preview', 'Settings'],
    popupSupportBadges: ['WeRead enabled by default', 'Current site enabled'],
    popupStatusCopy:
      'The timer only moves while the page is visible, the tab is in front, and reading activity is still happening.',
    optionsTitle: 'Eye Care Reminder',
    optionsIntro: 'Breaks are based on active reading time, and all stats stay inside the current browser profile.',
    optionsMetrics: [
      ['Today Reading', '27 min'],
      ['Today Breaks', '1'],
      ['Status', 'Paused · 9m 40s'],
      ['Next Break', 'Waiting for reading']
    ],
    settingsTitle: 'Reminder Settings',
    settingsRows: [
      ['Mode', '20-20-20'],
      ['Standard', '20 min'],
      ['Voice Reminder', 'On'],
      ['Full-screen Reminder', 'On']
    ],
    reportTitle: 'Eye Care Report',
    reportSummary: [
      ['Reading', '27 min'],
      ['Breaks', '1'],
      ['Compliance', 'N/A'],
      ['Range', 'Last 7 days']
    ],
    reportTrend: [
      ['03-21', '14 min', 0.72],
      ['03-22', '13 min', 0.66]
    ],
    siteDistributionTitle: 'Site Distribution',
    siteDistribution: [
      ['Unknown site', '14 min · 0 breaks'],
      ['weread.qq.com', '12 min · 1 break']
    ],
    enabledSitesTitle: 'Enabled Sites',
    enabledSites: ['weread.qq.com', 'sspai.com'],
    dataTitle: 'Data Management',
    dataDescription: 'PDF is for reading or sharing; CSV is for backup and raw self-analysis.',
    dataButtons: ['Export Report PDF', 'Export Raw Data CSV', 'Reset Local Data'],
    reminderBookTitle: 'Time for an eye break',
    reminderBody: 'The 20-20-20 mode is active: look into the distance and follow a short guided break.',
    reminderMessage: 'Look 20 feet away for at least 20 seconds',
    reminderCountdown: '12 seconds left',
    reminderSteps: [
      'Look into the distance',
      'Move your eyes left and right',
      'Move your eyes up and down',
      'Close your eyes and breathe once'
    ],
    reminderHint: 'The reminder can close after the countdown ends',
    reminderButton: 'Wait for countdown',
    toolbarLabels: {
      active: 'READ',
      paused: 'PAUSE',
      activeCaption: 'Live reading',
      pausedCaption: 'Paused'
    },
    toolbarAddress: 'https://sspai.com/post/active-reading',
    toolbarCopyActive:
      'The current tab is enabled and still active, so the badge stays on READ while the next break keeps moving.',
    toolbarCopyPaused:
      'If you switch tabs, stop interacting, or the site is not enabled, the badge drops back to PAUSE immediately.',
    screens: {
      popup: {
        badge: 'Popup Overview',
        title: 'WeRead works immediately, and any normal page can be enabled site by site',
        subtitle: 'Reading time, status reasoning, and the next break all stay visible in one small panel.',
        bullets: ['One-click site enablement', 'Preview reminders', 'Why paused is explicit']
      },
      options: {
        badge: 'Settings',
        title: 'Settings, reports, and data actions now live in a clearer hierarchy',
        subtitle: 'Reminder controls stay on top, while reports and raw-data actions are grouped below.',
        bullets: ['20-20-20 and standard mode', 'Report vs raw data exports', 'Manage enabled sites']
      },
      reminder: {
        badge: 'Full-screen Reminder',
        title: 'The 20-20-20 flow guides a real short break',
        subtitle: 'A countdown, guided steps, and a delayed close button make the break harder to skip.',
        bullets: ['20-second countdown', 'Guided break steps', 'Reduced-motion fallback']
      },
      toolbar: {
        badge: 'Toolbar Badge',
        title: 'Know whether the current tab is still counting without opening the popup',
        subtitle: 'Enabled active tabs show READ; paused or stopped tabs show PAUSE.',
        bullets: ['Current-tab aware', 'READ / PAUSE at a glance', 'Matches popup state']
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
  .scaled-panel {
    transform: scale(0.7);
    transform-origin: top left;
    width: calc(100% / 0.7);
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .status-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .status-pill {
    border-radius: 16px;
    background: #fff7ec;
    padding: 10px 12px;
  }
  .status-pill-label {
    font-size: 13px;
    color: #6b5d50;
    margin-bottom: 6px;
  }
  .status-pill-value {
    font-size: 18px;
    line-height: 1.22;
    font-weight: 800;
    color: #201914;
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
  .support-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }
  .support-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(45, 106, 79, 0.12);
    color: #2d6a4f;
    font-size: 16px;
    font-weight: 700;
  }
  .support-copy {
    margin-top: 16px;
    font-size: 17px;
    line-height: 1.6;
    color: #5b4d41;
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
    margin: 16px 0 0;
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
  .options-stack {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }
  .section-card {
    border-radius: 22px;
    background: #fff8ee;
    padding: 16px;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .section-title {
    font-size: 24px;
    font-weight: 800;
  }
  .section-note {
    font-size: 14px;
    line-height: 1.5;
    color: #6b5d50;
  }
  .section-pill {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #fff;
    color: #2d6a4f;
    font-size: 14px;
    font-weight: 800;
  }
  .options-columns {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 16px;
  }
  .report-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }
  .summary-card {
    border-radius: 16px;
    background: rgba(255,255,255,0.76);
    padding: 10px 12px;
  }
  .summary-label {
    font-size: 14px;
    color: #6b5d50;
    margin-bottom: 6px;
  }
  .summary-value {
    font-size: 18px;
    font-weight: 800;
  }
  .report-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
    gap: 12px;
    margin-top: 12px;
  }
  .mini-card {
    border-radius: 18px;
    background: rgba(255,255,255,0.76);
    padding: 12px;
  }
  .mini-title {
    font-size: 16px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  .trend-list {
    display: grid;
    gap: 8px;
  }
  .trend-row {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #6b5d50;
  }
  .trend-bar {
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: #dfe7df;
  }
  .trend-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #2d6a4f, #5aa37d);
  }
  .site-list {
    display: grid;
    gap: 12px;
  }
  .site-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .site-name {
    font-size: 15px;
    font-weight: 800;
  }
  .site-copy {
    font-size: 13px;
    color: #6b5d50;
  }
  .site-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }
  .site-chip {
    display: inline-flex;
    align-items: center;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,0.8);
    font-size: 15px;
    font-weight: 700;
    color: #3c342b;
  }
  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  .action-row .button-pill {
    padding: 12px 14px;
    font-size: 15px;
  }
  .button-pill.ghost {
    background: #eff3ef;
    color: #2d6a4f;
  }
  .button-pill.danger {
    background: #d85867;
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
    box-shadow: 0 30px 80px rgba(0,0,0,0.32);
  }
  .overlay-title {
    font-size: 30px;
    line-height: 1.35;
    font-weight: 800;
    margin-bottom: 16px;
  }
  .overlay-countdown {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(45, 106, 79, 0.12);
    color: #2d6a4f;
    font-size: 16px;
    font-weight: 800;
    margin-bottom: 18px;
  }
  .overlay-copy {
    font-size: 18px;
    line-height: 1.7;
    color: #5b4d41;
    margin-bottom: 18px;
  }
  .step-list {
    display: grid;
    gap: 10px;
    margin: 0 0 18px;
  }
  .step-row {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 16px;
    background: rgba(255,255,255,0.72);
    padding: 12px 14px;
    font-size: 17px;
    color: #3f3429;
  }
  .step-index {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #2d6a4f;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 14px;
    font-weight: 800;
    flex: 0 0 auto;
  }
  .overlay-hint {
    font-size: 15px;
    color: #6b5d50;
    margin-bottom: 14px;
  }
  .overlay-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 190px;
    border-radius: 999px;
    background: #cad8d0;
    color: #345746;
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
        <div class="support-badges">
          ${localeConfig.popupSupportBadges
            .map((badge) => `<span class="support-badge">${badge}</span>`)
            .join('')}
        </div>
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
        <div class="support-copy">${localeConfig.popupStatusCopy}</div>
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
      <div class="scaled-panel">
        <div class="panel-card">
          <div style="font-size: 34px; font-weight: 800; margin-bottom: 8px;">${localeConfig.optionsTitle}</div>
          <div style="font-size: 20px; color: #5b4d41;">${localeConfig.optionsIntro}</div>
          <div class="status-strip">
            ${localeConfig.optionsMetrics
              .map(
                ([label, value]) => `
                  <div class="status-pill">
                    <div class="status-pill-label">${label}</div>
                    <div class="status-pill-value">${value}</div>
                  </div>
                `
              )
              .join('')}
          </div>
          <div class="options-stack">
            <div class="options-columns">
              <div class="section-card">
                <div class="section-head">
                  <div class="section-title">${localeConfig.settingsTitle}</div>
                  <div class="section-pill">20-20-20</div>
                </div>
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
              </div>
              <div class="section-card">
                <div class="section-head">
                  <div class="section-title">${localeConfig.enabledSitesTitle}</div>
                  <div class="section-note">${
                    localeConfig.lang === 'zh-CN' ? '通过 popup 单独授权后可管理。' : 'Manage sites granted from the popup.'
                  }</div>
                </div>
                <div class="site-chip-list">
                  ${localeConfig.enabledSites.map((site) => `<span class="site-chip">${site}</span>`).join('')}
                </div>
              </div>
            </div>
            <div class="section-card">
              <div class="section-head">
                <div class="section-title">${localeConfig.reportTitle}</div>
                <div class="section-pill">${localeConfig.reportSummary[3][1]}</div>
              </div>
              <div class="report-summary">
                ${localeConfig.reportSummary
                  .map(
                    ([label, value]) => `
                      <div class="summary-card">
                        <div class="summary-label">${label}</div>
                        <div class="summary-value">${value}</div>
                      </div>
                    `
                  )
                  .join('')}
              </div>
              <div class="report-layout">
                <div class="mini-card">
                  <div class="mini-title">${
                    localeConfig.lang === 'zh-CN' ? '最近趋势' : 'Recent Trend'
                  }</div>
                  <div class="trend-list">
                    ${localeConfig.reportTrend
                      .map(
                        ([label, value, ratio]) => `
                          <div class="trend-row">
                            <span>${label}</span>
                            <span class="trend-bar"><span class="trend-bar-fill" style="width: ${Math.max(
                              Number(ratio) * 100,
                              8
                            )}%"></span></span>
                            <span>${value}</span>
                          </div>
                        `
                      )
                      .join('')}
                  </div>
                </div>
                <div class="mini-card">
                  <div class="mini-title">${localeConfig.siteDistributionTitle}</div>
                  <div class="site-list">
                    ${localeConfig.siteDistribution
                      .map(
                        ([label, value]) => `
                          <div class="site-item">
                            <div class="site-name">${label}</div>
                            <div class="site-copy">${value}</div>
                          </div>
                        `
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>
            <div class="section-card">
              <div class="section-head">
                <div class="section-title">${localeConfig.dataTitle}</div>
              </div>
              <div class="section-note">${localeConfig.dataDescription}</div>
              <div class="action-row">
                <div class="button-pill">${localeConfig.dataButtons[0]}</div>
                <div class="button-pill ghost">${localeConfig.dataButtons[1]}</div>
                <div class="button-pill danger">${localeConfig.dataButtons[2]}</div>
              </div>
            </div>
          </div>
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
          <div class="overlay-countdown">${localeConfig.reminderCountdown}</div>
          <div class="overlay-copy">${localeConfig.reminderBody}</div>
          <div class="step-list">
            ${localeConfig.reminderSteps
              .map(
                (step, index) => `
                  <div class="step-row">
                    <span class="step-index">${index + 1}</span>
                    <span>${step}</span>
                  </div>
                `
              )
              .join('')}
          </div>
          <div class="overlay-hint">${localeConfig.reminderHint}</div>
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
          <div class="address-bar">${localeConfig.toolbarAddress}</div>
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
                localeConfig.toolbarCopyActive
              }</div>
            </div>
            <div class="legend-card">
              <div class="legend-head">
                <span class="legend-badge" style="background: #8B8478;">${localeConfig.toolbarLabels.paused}</span>
                <span class="legend-title">${localeConfig.toolbarLabels.pausedCaption}</span>
              </div>
              <div class="legend-copy">${
                localeConfig.toolbarCopyPaused
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
