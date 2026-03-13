import { AppStorage } from '../shared/storage';
import { buildReminderStatusSummary, buildStatsSummary } from '../ui/summary';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function render(): Promise<void> {
  const storage = new AppStorage();
  const state = await storage.loadState();
  const summary = buildStatsSummary(state.stats, today());
  const status = buildReminderStatusSummary(state, Date.now());
  const app = document.getElementById('app');

  if (!app) {
    return;
  }

  const recoveryRate =
    summary.recoverySuccessRate === null ? '暂无' : `${Math.round(summary.recoverySuccessRate * 100)}%`;

  app.innerHTML = `
    <section class="panel">
      <h1>微信读书护眼</h1>
      <div>本地护眼统计与恢复效果概览</div>
      <div class="grid">
        <div class="metric"><span>当前模式</span><strong>${status.modeLabel}</strong></div>
        <div class="metric"><span>当前策略</span><strong>${status.strategyLabel}</strong></div>
        <div class="metric"><span>最早下次提醒</span><strong>${status.nextEligibleReminderLabel}</strong></div>
        <div class="metric"><span>今日阅读</span><strong>${summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>累计阅读</span><strong>${summary.totalReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>今日提醒</span><strong>${summary.todayReminderCount} 次</strong></div>
        <div class="metric"><span>累计提醒</span><strong>${summary.totalReminderCount} 次</strong></div>
      </div>
      <div class="hint">策略说明：${status.strategyDescription}</div>
      ${status.runtimeIssueSummary ? `<div class="hint">当前状态：${status.runtimeIssueSummary}</div>` : ''}
      <div class="hint">提醒后恢复成功率：${recoveryRate}</div>
      <div class="hint">更多明细与导出请打开扩展选项页。</div>
    </section>
  `;
}

void render();
