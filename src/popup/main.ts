import { AppStorage } from '../shared/storage';
import { buildReminderStatusSummary, buildStatsSummary } from '../ui/summary';
import {
  PREVIEW_REMINDER_COMMAND,
  buildPreviewReminderState
} from './preview';
import { bindPopupActions } from './actions';
import { derivePopupRuntimeState } from './live-status';

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
  const activeTab = await getActiveTab();
  const previewState = buildPreviewReminderState(activeTab);
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  const popupOpenedAt = Date.now();
  const updateStatus = () => {
    const liveState = derivePopupRuntimeState(state, popupOpenedAt, Date.now());
    const status = buildReminderStatusSummary(liveState, Date.now());
    const readingStatusNode = document.getElementById('reading-status-value');
    const nextReminderNode = document.getElementById('next-reminder-value');

    if (readingStatusNode) {
      readingStatusNode.textContent = previewState.enabled ? status.readingStatusLabel : '已暂停 · 0分00秒';
    }

    if (nextReminderNode) {
      nextReminderNode.textContent = previewState.enabled ? status.nextEligibleReminderLabel : '等待开始阅读';
    }
  };

  app.innerHTML = `
    <section class="panel">
      <h1>微信读书护眼</h1>
      <div>微信读书阅读提醒</div>
      <div class="grid">
        <div class="metric"><span>今日阅读</span><strong>${summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>今日提醒</span><strong>${summary.todayReminderCount} 次</strong></div>
        <div class="metric"><span>阅读状态</span><strong id="reading-status-value"></strong></div>
        <div class="metric"><span>下次提醒</span><strong id="next-reminder-value"></strong></div>
      </div>
      <div class="actions">
        <button id="preview-reminder" ${previewState.enabled ? '' : 'disabled'}>预览提醒</button>
        <button id="open-settings" class="secondary">提醒设置</button>
      </div>
    </section>
  `;

  updateStatus();
  window.setInterval(updateStatus, 1_000);

  bindPopupActions({
    root: document,
    onPreview: async () => {
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
    },
    onOpenSettings: async () => {
      await chrome.runtime.openOptionsPage();
    }
  });
}

void render();
