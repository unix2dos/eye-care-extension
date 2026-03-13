import { exportBookStatsCsv } from '../shared/csv';
import { AppStorage } from '../shared/storage';
import type { ReminderStrategyPreset } from '../shared/types';
import { buildOptionsViewModel } from './view-model';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function render(): Promise<void> {
  const storage = new AppStorage();
  const state = await storage.loadState();
  const viewModel = buildOptionsViewModel(state, today());
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  const recoveryRate =
    viewModel.summary.recoverySuccessRate === null ? '暂无' : `${Math.round(viewModel.summary.recoverySuccessRate * 100)}%`;

  app.innerHTML = `
    <section class="card">
      <h1>微信读书护眼扩展</h1>
      <p>统计仅保存在当前 Chrome 本地，不上传原始画面或阅读记录。</p>
      <div class="metrics">
        <div class="metric"><div>当前模式</div><strong>${viewModel.modeLabel}</strong></div>
        <div class="metric"><div>当前策略</div><strong>${viewModel.selectedStrategyLabel}</strong></div>
        <div class="metric"><div>最近校准</div><strong>${viewModel.calibrationLabel}</strong></div>
        <div class="metric"><div>校准采样</div><strong>${viewModel.calibrationSamplesLabel}</strong></div>
        <div class="metric"><div>今日阅读</div><strong>${viewModel.summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><div>累计阅读</div><strong>${viewModel.summary.totalReadingMinutes} 分钟</strong></div>
        <div class="metric"><div>今日提醒</div><strong>${viewModel.summary.todayReminderCount} 次</strong></div>
        <div class="metric"><div>恢复成功率</div><strong>${recoveryRate}</strong></div>
      </div>
      <section class="trend">
        <h2>提醒策略</h2>
        <div class="strategy-list">
          ${viewModel.strategyOptions
            .map(
              (option) => `
                <label class="strategy-option">
                  <input type="radio" name="strategy" value="${option.id}" ${option.selected ? 'checked' : ''} />
                  <span>
                    <strong>${option.label}</strong>
                    <small>${option.description}</small>
                  </span>
                </label>
              `
            )
            .join('')}
        </div>
      </section>
      <section class="trend">
        <h2>启动状态</h2>
        <div class="metric">
          <div>${viewModel.runtimeIssueTitle}</div>
          <strong>${viewModel.runtimeIssueGuidance}</strong>
        </div>
      </section>
      <div class="actions">
        <button id="export">导出按书统计 CSV</button>
        <button id="recalibrate">重新校准</button>
        <button id="reset" class="secondary">清空本地统计</button>
      </div>
      <section class="trend">
        <h2>长期趋势</h2>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>阅读时长</th>
              <th>提醒次数</th>
              <th>平均眨眼率</th>
            </tr>
          </thead>
          <tbody>
            ${viewModel.summary.trend
              .map(
                (point) => `
                  <tr>
                    <td>${point.date}</td>
                    <td>${point.readingMinutes} 分钟</td>
                    <td>${point.reminderCount}</td>
                    <td>${point.averageBlinkRatePerMinute === null ? '暂无' : point.averageBlinkRatePerMinute.toFixed(1)}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </section>
    </section>
  `;

  document.getElementById('export')?.addEventListener('click', () => {
    downloadCsv(`weread-eye-care-${today()}.csv`, exportBookStatsCsv(state.stats));
  });

  document.querySelectorAll<HTMLInputElement>('input[name="strategy"]').forEach((input) => {
    input.addEventListener('change', async () => {
      if (!input.checked) {
        return;
      }

      await storage.setStrategyPreset(input.value as ReminderStrategyPreset);
      await render();
    });
  });

  document.getElementById('recalibrate')?.addEventListener('click', async () => {
    await storage.resetCalibration();
    await render();
  });

  document.getElementById('reset')?.addEventListener('click', async () => {
    await storage.resetState();
    await render();
  });
}

void render();
