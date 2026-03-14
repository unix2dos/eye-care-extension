import { AppStorage } from '../shared/storage';
import { REMINDER_INTERVAL_OPTIONS } from '../shared/constants';
import { exportBookStatsCsv } from '../shared/csv';
import type { ReminderSettings } from '../shared/types';
import { buildExportFilename, downloadCsv } from './export';
import { buildOptionsViewModel } from './view-model';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseReminderIntervalMinutes(value: string): ReminderSettings['reminderIntervalMinutes'] {
  const minutes = Number(value);

  return minutes === 15 || minutes === 20 || minutes === 30 ? minutes : 20;
}

async function render(settingsStatusMessage = '修改后会立即保存并同步到当前阅读页。'): Promise<void> {
  const storage = new AppStorage();
  const state = await storage.loadState();
  const viewModel = buildOptionsViewModel(state, today());
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="card">
      <h1>微信读书护眼扩展</h1>
      <p>扩展只按你的活跃阅读时长提醒。</p>
      <div class="metrics">
        <div class="metric"><div>今日阅读</div><strong>${viewModel.summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><div>今日提醒</div><strong>${viewModel.summary.todayReminderCount} 次</strong></div>
        <div class="metric"><div>阅读状态</div><strong>${viewModel.readingStatusLabel}</strong></div>
        <div class="metric"><div>下次提醒</div><strong>${viewModel.nextReminderLabel}</strong></div>
      </div>
      <section class="settings">
        <h2>提醒设置</h2>
        <label class="setting">
          <span>提醒间隔</span>
          <select id="reminder-interval">
            ${REMINDER_INTERVAL_OPTIONS.map((minutes) => {
              const selected = state.settings.reminderIntervalMinutes === minutes ? 'selected' : '';
              return `<option value="${minutes}" ${selected}>${minutes} 分钟</option>`;
            }).join('')}
          </select>
        </label>
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
      <div class="actions">
        <button id="export">导出 CSV</button>
        <button id="reset" class="secondary">清空本地统计</button>
      </div>
      <p>当你在微信读书页面持续活跃阅读累计 ${state.settings.reminderIntervalMinutes} 分钟时，扩展会弹出提醒${state.settings.audioEnabled ? '并播放固定语音' : ''}。</p>
      <p>导出文件只包含当前版本实际保存的数据：日期、书名、阅读分钟数、提醒次数。</p>
    </section>
  `;

  const readSettings = (): ReminderSettings => ({
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

  document.getElementById('reminder-interval')?.addEventListener('change', () => {
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
}

void render();
