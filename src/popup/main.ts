import { AppStorage } from '../shared/storage';
import { getActiveTab, resolvePopupRuntimeStatus } from '../shared/runtime-status';
import { resolveTabSiteAccess, type TabSiteAccessState } from '../shared/site-access';
import { buildReminderStatusSummary, buildStatsSummary } from '../ui/summary';
import {
  PREVIEW_REMINDER_COMMAND,
  buildPreviewReminderState
} from './preview';
import { bindPopupActions } from './actions';

let statusIntervalId: number | null = null;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildInactiveStatus(siteAccess: TabSiteAccessState): {
  readingStatusLabel: string;
  nextReminderLabel: string;
  statusExplanationLabel: string;
} {
  if (!siteAccess.isInjectable) {
    return {
      readingStatusLabel: '不可用',
      nextReminderLabel: '当前页面不支持',
      statusExplanationLabel: '当前页面暂不支持启用护眼提醒'
    };
  }

  return {
    readingStatusLabel: '未启用',
    nextReminderLabel: '授权后可用',
    statusExplanationLabel: '授权后会在当前站点开始计时和提醒'
  };
}

async function injectContentScript(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/main.js']
  });
}

async function render(statusHint?: string): Promise<void> {
  if (statusIntervalId !== null) {
    window.clearInterval(statusIntervalId);
    statusIntervalId = null;
  }

  const storage = new AppStorage();
  const persistedState = await storage.loadState();
  const summary = buildStatsSummary(persistedState.stats, today());
  const activeTab = await getActiveTab();
  const siteAccess = await resolveTabSiteAccess(activeTab);
  const previewState = buildPreviewReminderState(activeTab, siteAccess.hasAccess);
  const app = document.getElementById('app');
  const inactiveStatus = buildInactiveStatus(siteAccess);

  if (!app) {
    return;
  }

  if (siteAccess.hasAccess && typeof activeTab?.id === 'number' && !siteAccess.isWeRead) {
    try {
      await injectContentScript(activeTab.id);
    } catch {
      // The popup should stay usable if the current tab disappears during injection.
    }
  }

  const updateStatus = async () => {
    if (!siteAccess.hasAccess) {
      return;
    }

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
      <h1>护眼提醒</h1>
      <div>按活跃用眼时间提醒休息</div>
      <div class="grid">
        <div class="metric"><span>今日阅读</span><strong>${summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>今日提醒</span><strong>${summary.todayReminderCount} 次</strong></div>
        <div class="metric"><span>阅读状态</span><strong id="reading-status-value">${inactiveStatus.readingStatusLabel}</strong></div>
        <div class="metric"><span>下次提醒</span><strong id="next-reminder-value">${inactiveStatus.nextReminderLabel}</strong></div>
      </div>
      <p class="hint" id="status-explanation">${statusHint ?? inactiveStatus.statusExplanationLabel}</p>
      <div class="actions">
        ${!siteAccess.hasAccess && siteAccess.isInjectable ? '<button id="enable-site">在此站点启用护眼提醒</button>' : ''}
        <button id="preview-reminder" ${previewState.enabled ? '' : 'disabled'}>预览提醒</button>
        <button id="open-settings" class="secondary">提醒设置</button>
      </div>
    </section>
  `;

  if (siteAccess.hasAccess) {
    await updateStatus();
    statusIntervalId = window.setInterval(() => {
      void updateStatus();
    }, 1_000);
  }

  bindPopupActions({
    root: document,
    onEnableSite: async () => {
      if (typeof activeTab?.id !== 'number' || !siteAccess.originPattern) {
        return;
      }

      let granted = false;
      try {
        granted = await chrome.permissions.request({
          origins: [siteAccess.originPattern]
        });
      } catch {
        granted = false;
      }

      if (!granted) {
        await render('当前站点尚未启用护眼提醒');
        return;
      }

      try {
        await injectContentScript(activeTab.id);
      } catch {
        // The next render will still show the site as enabled if permission was granted.
      }

      await render('当前站点已启用护眼提醒');
    },
    onPreview: async () => {
      if (!previewState.enabled || previewState.tabId === null) {
        return;
      }

      try {
        if (!siteAccess.isWeRead) {
          await injectContentScript(previewState.tabId);
        }
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
