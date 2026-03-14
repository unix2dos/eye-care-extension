import { AppStorage } from '../shared/storage';
import { getActiveTab, resolvePopupRuntimeStatus } from '../shared/runtime-status';
import { buildReminderStatusSummary, buildStatsSummary } from '../ui/summary';
import {
  PREVIEW_REMINDER_COMMAND,
  buildPreviewReminderState
} from './preview';
import { bindPopupActions } from './actions';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function render(): Promise<void> {
  const storage = new AppStorage();
  const persistedState = await storage.loadState();
  const summary = buildStatsSummary(persistedState.stats, today());
  const activeTab = await getActiveTab();
  const previewState = buildPreviewReminderState(activeTab);
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  const updateStatus = async () => {
    const runtimeStatus = await resolvePopupRuntimeStatus(activeTab, await storage.loadState());
    const status = buildReminderStatusSummary(runtimeStatus, Date.now());
    const readingStatusNode = document.getElementById('reading-status-value');
    const nextReminderNode = document.getElementById('next-reminder-value');
    const explanationNode = document.getElementById('status-explanation');

    if (readingStatusNode) {
      readingStatusNode.textContent = status.readingStatusLabel;
    }

    if (nextReminderNode) {
      nextReminderNode.textContent = status.nextEligibleReminderLabel;
    }

    if (explanationNode) {
      explanationNode.textContent = status.statusExplanationLabel;
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
      <p class="hint" id="status-explanation"></p>
      <div class="actions">
        <button id="preview-reminder" ${previewState.enabled ? '' : 'disabled'}>预览提醒</button>
        <button id="open-settings" class="secondary">提醒设置</button>
      </div>
    </section>
  `;

  await updateStatus();
  window.setInterval(() => {
    void updateStatus();
  }, 1_000);

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
