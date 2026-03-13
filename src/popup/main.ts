import { AppStorage } from '../shared/storage';
import { buildStatsSummary } from '../ui/summary';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function render(): Promise<void> {
  const storage = new AppStorage();
  const stats = await storage.loadStats();
  const summary = buildStatsSummary(stats, today());
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
        <div class="metric"><span>今日阅读</span><strong>${summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>累计阅读</span><strong>${summary.totalReadingMinutes} 分钟</strong></div>
        <div class="metric"><span>今日提醒</span><strong>${summary.todayReminderCount} 次</strong></div>
        <div class="metric"><span>累计提醒</span><strong>${summary.totalReminderCount} 次</strong></div>
      </div>
      <div class="hint">提醒后恢复成功率：${recoveryRate}</div>
      <div class="hint">更多明细与导出请打开扩展选项页。</div>
    </section>
  `;
}

void render();
