import { AppStorage } from '../shared/storage';
import { buildReminderStatusSummary, buildStatsSummary } from '../ui/summary';
import {
  PREVIEW_DISABLED_HINT,
  PREVIEW_REMINDER_COMMAND,
  buildPreviewReminderState
} from './preview';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] ?? null;
}

async function render(): Promise<void> {
  const storage = new AppStorage();
  const state = await storage.loadState();
  const summary = buildStatsSummary(state.stats, today());
  const status = buildReminderStatusSummary(state, Date.now());
  const activeTab = await getActiveTab();
  const previewState = buildPreviewReminderState(activeTab);
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="panel">
      <h1>微信读书护眼</h1>
      <div>微信读书阅读提醒</div>
      <div class="grid">
        <div class="metric"><span>今日阅读</span><strong>${summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>今日提醒</span><strong>${summary.todayReminderCount} 次</strong></div>
        <div class="metric"><span>阅读状态</span><strong>${previewState.enabled ? status.readingStatusLabel : '已暂停计时（本轮计时 0 分钟）'}</strong></div>
        <div class="metric"><span>下次提醒</span><strong>${previewState.enabled ? status.nextEligibleReminderLabel : '等待开始阅读'}</strong></div>
      </div>
      <div style="margin-top: 14px;">
        <button id="preview-reminder" ${previewState.enabled ? '' : 'disabled'}>预览提醒</button>
      </div>
      <div class="hint">${previewState.hint ?? '在当前阅读页直接预览真实提醒效果。'}</div>
      <div class="hint">默认会用语音提醒你休息一下。</div>
    </section>
  `;

  document.getElementById('preview-reminder')?.addEventListener('click', async () => {
    if (!previewState.enabled || previewState.tabId === null) {
      return;
    }

    try {
      await chrome.tabs.sendMessage(previewState.tabId, {
        type: PREVIEW_REMINDER_COMMAND
      });
    } catch {
      // Keep the popup usable even if the target page was reloaded or unsupported.
    }
  });
}

void render();
