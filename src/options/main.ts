import { AppStorage } from '../shared/storage';
import { buildOptionsViewModel } from './view-model';
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function render(): Promise<void> {
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
      <p>扩展只按你的活跃阅读时长提醒，不使用摄像头。</p>
      <div class="metrics">
        <div class="metric"><div>今日阅读</div><strong>${viewModel.summary.todayReadingMinutes} 分钟</strong></div>
        <div class="metric"><div>今日提醒</div><strong>${viewModel.summary.todayReminderCount} 次</strong></div>
        <div class="metric"><div>阅读状态</div><strong>${viewModel.readingStatusLabel}</strong></div>
        <div class="metric"><div>下次提醒</div><strong>${viewModel.nextReminderLabel}</strong></div>
      </div>
      <div class="actions">
        <button id="reset" class="secondary">清空本地统计</button>
      </div>
      <p>当你在微信读书页面持续活跃阅读累计 20 分钟时，扩展会弹出提醒并播报语音。</p>
    </section>
  `;

  document.getElementById('reset')?.addEventListener('click', async () => {
    await storage.resetState();
    await render();
  });
}

void render();
