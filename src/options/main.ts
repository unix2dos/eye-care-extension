import { AppStorage } from '../shared/storage';
import { REMINDER_INTERVAL_OPTIONS } from '../shared/constants';
import { exportBookStatsCsv } from '../shared/csv';
import { getEffectiveReminderIntervalMinutes, getReminderCountdownSeconds } from '../shared/reminder-mode';
import { resolveOptionsRuntimeStatus } from '../shared/runtime-status';
import type { ReminderSettings } from '../shared/types';
import { buildExportFilename, downloadCsv } from './export';
import { buildEnabledSitesMarkup, loadEnabledSites, removeEnabledSite } from './sites';
import { buildOptionsViewModel } from './view-model';

let runtimeStatusIntervalId: number | null = null;

const REMINDER_MODE_LABELS: Record<ReminderSettings['reminderMode'], string> = {
  'twenty-twenty-twenty': '20-20-20 法则',
  standard: '标准提醒'
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseReminderIntervalMinutes(value: string): ReminderSettings['reminderIntervalMinutes'] {
  const minutes = Number(value);

  return minutes === 15 || minutes === 20 || minutes === 30 ? minutes : 20;
}

function parseReminderMode(value: string): ReminderSettings['reminderMode'] {
  return value === 'standard' ? 'standard' : 'twenty-twenty-twenty';
}

function buildReminderModeDescription(settings: ReminderSettings): string {
  if (settings.reminderMode === 'twenty-twenty-twenty') {
    return '固定每 20 分钟提醒一次，并要求看向 20 英尺外至少 20 秒。';
  }

  return '标准提醒只要求手动关闭弹窗，支持 15 / 20 / 30 分钟间隔。';
}

function buildReminderSummary(settings: ReminderSettings): string {
  const intervalMinutes = getEffectiveReminderIntervalMinutes(settings);
  const audioSummary = settings.audioEnabled ? '并播放固定语音' : '';
  const countdownSeconds = getReminderCountdownSeconds(settings);

  if (countdownSeconds) {
    return `当你在已启用站点持续活跃用眼累计 ${intervalMinutes} 分钟时，扩展会弹出 20-20-20 提醒：看向 20 英尺外至少 ${countdownSeconds} 秒${audioSummary}。`;
  }

  return `当你在已启用站点持续活跃用眼累计 ${intervalMinutes} 分钟时，扩展会弹出提醒${audioSummary}。`;
}

async function render(settingsStatusMessage = '修改后会立即保存并同步到已启用站点。'): Promise<void> {
  if (runtimeStatusIntervalId !== null) {
    window.clearInterval(runtimeStatusIntervalId);
    runtimeStatusIntervalId = null;
  }

  const storage = new AppStorage();
  const state = await storage.loadState();
  const runtimeStatus = await resolveOptionsRuntimeStatus(state);
  const enabledSites = await loadEnabledSites();
  const viewModel = buildOptionsViewModel(state, runtimeStatus, today());
  const usesFixedInterval = getReminderCountdownSeconds(state.settings) !== null;
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="card">
      <h1>护眼提醒扩展</h1>
      <p>扩展只按你的活跃用眼时长提醒。</p>
      <div class="metrics">
        <div class="metric"><div>今日阅读</div><strong>${viewModel.summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><div>今日提醒</div><strong>${viewModel.summary.todayReminderCount} 次</strong></div>
        <div class="metric"><div>阅读状态</div><strong id="reading-status-value">${viewModel.readingStatusLabel}</strong></div>
        <div class="metric"><div>下次提醒</div><strong id="next-reminder-value">${viewModel.nextReminderLabel}</strong></div>
      </div>
      <section class="runtime-status">
        <h2>当前状态</h2>
        <p id="status-explanation">${viewModel.statusExplanationLabel}</p>
        <dl id="runtime-status-list" class="status-list">
          ${viewModel.runtimeDetails
            .map(({ label, value }) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
            .join('')}
        </dl>
      </section>
      <section class="settings">
        <h2>提醒设置</h2>
        <label class="setting">
          <span>提醒模式</span>
          <select id="reminder-mode">
            ${Object.entries(REMINDER_MODE_LABELS)
              .map(([mode, label]) => {
                const selected = state.settings.reminderMode === mode ? 'selected' : '';
                return `<option value="${mode}" ${selected}>${label}</option>`;
              })
              .join('')}
          </select>
        </label>
        <label class="setting">
          <span>提醒间隔</span>
          <select id="reminder-interval" ${usesFixedInterval ? 'disabled' : ''}>
            ${REMINDER_INTERVAL_OPTIONS.map((minutes) => {
              const selected = state.settings.reminderIntervalMinutes === minutes ? 'selected' : '';
              return `<option value="${minutes}" ${selected}>${minutes} 分钟</option>`;
            }).join('')}
          </select>
        </label>
        <p class="setting-note">${buildReminderModeDescription(state.settings)}</p>
        <label class="setting checkbox">
          <input id="audio-enabled" type="checkbox" ${state.settings.audioEnabled ? 'checked' : ''} />
          <span>播放提醒语音</span>
        </label>
        <label class="setting checkbox">
          <input id="fullscreen-reminder" type="checkbox" ${state.settings.fullscreenReminder ? 'checked' : ''} />
          <span>使用全屏提醒</span>
        </label>
        <p id="settings-status" class="settings-status">${settingsStatusMessage}</p>
      </section>
      <section class="enabled-sites">
        <h2>已启用站点</h2>
        <p>这里展示通过 popup 单独授权过的站点，你可以随时撤销。</p>
        <div id="enabled-sites-list">
          ${buildEnabledSitesMarkup(enabledSites)}
        </div>
      </section>
      <div class="actions">
        <button id="export">导出 CSV</button>
        <button id="reset" class="secondary">清空本地统计</button>
      </div>
      <p>${buildReminderSummary(state.settings)}</p>
      <p>导出文件包含当前版本实际保存的数据：日期、域名、书名（如有）、阅读分钟数、提醒次数。</p>
    </section>
  `;

  const readSettings = (): ReminderSettings => ({
    reminderMode: parseReminderMode(
      (document.getElementById('reminder-mode') as HTMLSelectElement | null)?.value ?? state.settings.reminderMode
    ),
    reminderIntervalMinutes: parseReminderIntervalMinutes(
      (document.getElementById('reminder-interval') as HTMLSelectElement | null)?.value ?? String(state.settings.reminderIntervalMinutes)
    ),
    audioEnabled: Boolean((document.getElementById('audio-enabled') as HTMLInputElement | null)?.checked),
    fullscreenReminder: Boolean(
      (document.getElementById('fullscreen-reminder') as HTMLInputElement | null)?.checked
    )
  });

  const persistSettings = async () => {
    await storage.saveSettings(readSettings());
    await render('提醒设置已保存。');
  };

  const updateRuntimeStatus = async () => {
    const latestState = await storage.loadState();
    const latestRuntimeStatus = await resolveOptionsRuntimeStatus(latestState);
    const latestViewModel = buildOptionsViewModel(latestState, latestRuntimeStatus, today(), Date.now());
    const readingStatusNode = document.getElementById('reading-status-value');
    const nextReminderNode = document.getElementById('next-reminder-value');
    const explanationNode = document.getElementById('status-explanation');
    const runtimeListNode = document.getElementById('runtime-status-list');

    if (readingStatusNode) {
      readingStatusNode.textContent = latestViewModel.readingStatusLabel;
    }

    if (nextReminderNode) {
      nextReminderNode.textContent = latestViewModel.nextReminderLabel;
    }

    if (explanationNode) {
      explanationNode.textContent = latestViewModel.statusExplanationLabel;
    }

    if (runtimeListNode) {
      runtimeListNode.innerHTML = latestViewModel.runtimeDetails
        .map(({ label, value }) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
        .join('');
    }
  };

  document.getElementById('reminder-interval')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('reminder-mode')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('audio-enabled')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('fullscreen-reminder')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('export')?.addEventListener('click', async () => {
    const latest = await storage.loadState();
    const csv = exportBookStatsCsv(latest.stats);

    downloadCsv(buildExportFilename(today()), csv);
  });

  document.getElementById('reset')?.addEventListener('click', async () => {
    await storage.resetState();
    await render('本地统计与提醒设置都已恢复默认值。');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-remove-origin]').forEach((button) => {
    button.addEventListener('click', () => {
      const origin = button.dataset.removeOrigin;
      if (!origin) {
        return;
      }

      void (async () => {
        const removed = await removeEnabledSite(origin);
        await render(removed ? '已移除站点权限。' : '未能移除站点权限。');
      })();
    });
  });

  runtimeStatusIntervalId = window.setInterval(() => {
    void updateRuntimeStatus();
  }, 1_000);
}

void render();
