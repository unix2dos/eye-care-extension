import { AppStorage } from '../shared/storage';
import { DEFAULT_REMINDER_SETTINGS, REMINDER_INTERVAL_OPTIONS } from '../shared/constants';
import { exportBookStatsCsv } from '../shared/csv';
import { getOptionsHealthNoticeLines } from '../shared/disclaimer';
import {
  canUseBreakGuideAnimation,
  canUseCustomReminderInterval,
  canUsePdfExport,
  clampReportRangeDays,
  CUSTOM_REMINDER_INTERVAL_MINUTES_MAX,
  CUSTOM_REMINDER_INTERVAL_MINUTES_MIN,
  isPresetReminderInterval,
  sanitizeReminderSettingsForPlan
} from '../shared/plan';
import { getEffectiveReminderIntervalMinutes, getReminderCountdownSeconds } from '../shared/reminder-mode';
import { resolveOptionsRuntimeStatus } from '../shared/runtime-status';
import type { ReminderSettings, SubscriptionPlan } from '../shared/types';
import { buildExportFilename, downloadCsv } from './export';
import { buildEyeCareReportModel, type ReportRangeDays } from './report-model';
import { exportEyeCareReportPdf } from './report-pdf';
import { RESET_DATA_LABEL, shouldResetLocalData } from './reset';
import { buildEnabledSitesMarkup, loadEnabledSites, removeEnabledSite } from './sites';
import { buildOptionsViewModel } from './view-model';

let runtimeStatusIntervalId: number | null = null;
let selectedReportRangeDays: ReportRangeDays = 7;

const REMINDER_MODE_LABELS: Record<ReminderSettings['reminderMode'], string> = {
  'twenty-twenty-twenty': '20-20-20 法则',
  standard: '标准提醒'
};

const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: '免费版',
  pro: '专业版预览'
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseReminderIntervalMinutes(value: string): ReminderSettings['reminderIntervalMinutes'] {
  const minutes = Number(value);

  return minutes === 15 || minutes === 20 || minutes === 30 ? minutes : 20;
}

function parseCustomReminderIntervalMinutes(value: string): ReminderSettings['reminderIntervalMinutes'] {
  const minutes = Number(value);

  return Number.isFinite(minutes) ? Math.round(minutes) : DEFAULT_REMINDER_SETTINGS.reminderIntervalMinutes;
}

function parseReminderMode(value: string): ReminderSettings['reminderMode'] {
  return value === 'standard' ? 'standard' : 'twenty-twenty-twenty';
}

function parseSubscriptionPlan(value: string): SubscriptionPlan {
  return value === 'pro' ? 'pro' : 'free';
}

function parseReportRangeDays(value: string): ReportRangeDays {
  return value === '30' ? 30 : 7;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatComplianceRate(rate: number | null): string {
  return rate === null ? '暂无' : `${Math.round(rate * 100)}%`;
}

function buildReminderModeDescription(settings: ReminderSettings): string {
  if (settings.reminderMode === 'twenty-twenty-twenty') {
    return '固定每 20 分钟提醒一次，并要求看向 20 英尺外至少 20 秒。';
  }

  return '标准提醒只要求手动关闭弹窗，支持 15 / 20 / 30 分钟间隔。';
}

function buildPlanDescription(plan: SubscriptionPlan): string {
  if (plan === 'pro') {
    return '当前是本地专业版预览，已解锁动画引导、PDF 导出、最近 30 天趋势和自定义分钟数间隔。';
  }

  return '免费版保留全站点提醒、20-20-20、最近 7 天基础统计和 15 / 20 / 30 分钟预设间隔。';
}

function buildPlanFeatureMarkup(plan: SubscriptionPlan): string {
  const rows = [
    {
      label: '休息引导动画',
      enabled: canUseBreakGuideAnimation(plan),
      enabledText: '提醒时显示动态眼部放松引导',
      disabledText: '免费版显示文字版 4 步引导'
    },
    {
      label: 'PDF 报告导出',
      enabled: canUsePdfExport(plan),
      enabledText: '支持导出中文 PDF 报告',
      disabledText: '免费版只保留页面内报告'
    },
    {
      label: '趋势范围',
      enabled: clampReportRangeDays(30, plan) === 30,
      enabledText: '支持最近 30 天完整趋势',
      disabledText: '免费版仅展示最近 7 天'
    },
    {
      label: '提醒间隔',
      enabled: canUseCustomReminderInterval(plan),
      enabledText: `标准提醒支持 ${CUSTOM_REMINDER_INTERVAL_MINUTES_MIN}-${CUSTOM_REMINDER_INTERVAL_MINUTES_MAX} 分钟任意整数`,
      disabledText: '免费版仅支持 15 / 20 / 30 分钟预设'
    }
  ];

  return `
    <ul class="plan-feature-list">
      ${rows
        .map(
          (row) => `
            <li class="plan-feature-row">
              <strong>${row.label}</strong>
              <span class="plan-feature-copy">${row.enabled ? row.enabledText : row.disabledText}</span>
              <span class="plan-feature-badge" data-enabled="${row.enabled}">${row.enabled ? '已解锁' : '专业版'}</span>
            </li>
          `
        )
        .join('')}
    </ul>
  `;
}

function buildPlanPreviewMarkup(plan: SubscriptionPlan): string {
  return `
    <details class="settings plan-preview">
      <summary class="section-toggle">
        <span class="section-toggle-copy">
          <strong>版本预览</strong>
          <span class="section-toggle-note">用于本地验证免费版 / 专业版的功能锁态</span>
        </span>
        <span class="toggle-meta">${SUBSCRIPTION_PLAN_LABELS[plan]}</span>
      </summary>
      <div class="details-body">
        <label class="setting">
          <span>当前版本</span>
          <select id="subscription-plan">
            ${Object.entries(SUBSCRIPTION_PLAN_LABELS)
              .map(([entryPlan, label]) => {
                const selected = plan === entryPlan ? 'selected' : '';
                return `<option value="${entryPlan}" ${selected}>${label}</option>`;
              })
              .join('')}
          </select>
        </label>
        <p class="setting-note">${buildPlanDescription(plan)}</p>
        <p class="setting-note">真实支付接入尚未上线，这里先用本地切换验证付费能力边界。</p>
        ${buildPlanFeatureMarkup(plan)}
      </div>
    </details>
  `;
}

function buildHealthNoticeMarkup(): string {
  return `
    <section class="settings health-notice">
      <h2>健康与隐私说明</h2>
      <ul class="notice-list">
        ${getOptionsHealthNoticeLines()
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join('')}
      </ul>
    </section>
  `;
}

function getReminderIntervalSelectValue(settings: ReminderSettings, plan: SubscriptionPlan): string {
  return canUseCustomReminderInterval(plan) && !isPresetReminderInterval(settings.reminderIntervalMinutes)
    ? 'custom'
    : String(settings.reminderIntervalMinutes);
}

function getCustomReminderIntervalValue(settings: ReminderSettings): number {
  return isPresetReminderInterval(settings.reminderIntervalMinutes)
    ? DEFAULT_REMINDER_SETTINGS.reminderIntervalMinutes
    : settings.reminderIntervalMinutes;
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

function buildRuntimeDiagnosticsMarkup(viewModel: ReturnType<typeof buildOptionsViewModel>): string {
  return `
    <details class="runtime-status runtime-diagnostics">
      <summary class="section-toggle">
        <span class="section-toggle-copy">
          <strong>运行诊断</strong>
          <span data-status-explanation class="section-toggle-note">${viewModel.statusExplanationLabel}</span>
        </span>
        <span class="toggle-meta">高级状态</span>
      </summary>
      <div class="details-body">
        <dl id="runtime-status-list" class="status-list">
          ${viewModel.runtimeDetails
            .map(({ label, value }) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
            .join('')}
        </dl>
      </div>
    </details>
  `;
}

function buildDataManagementMarkup(): string {
  return `
    <section class="settings data-management">
      <h2>数据管理</h2>
      <p class="setting-note">报告 PDF 适合打印或分享；CSV 适合备份和自行分析原始统计数据。</p>
      <div class="actions">
        <button id="export" class="tertiary">导出原始数据 CSV</button>
        <button id="reset" class="secondary">${RESET_DATA_LABEL}</button>
      </div>
      <p class="setting-note">CSV 包含当前版本实际保存的数据：日期、域名、书名（如有）、阅读分钟数、提醒次数。</p>
    </section>
  `;
}

function buildReportMarkup(report: ReturnType<typeof buildEyeCareReportModel>, plan: SubscriptionPlan): string {
  const maxReadingMinutes = Math.max(...report.trend.map((point) => point.readingMinutes), 1);
  const pdfExportEnabled = canUsePdfExport(plan);
  const thirtyDayEnabled = clampReportRangeDays(30, plan) === 30;
  const domainMarkup =
    report.domains.length === 0
      ? '<p class="empty-state">当前范围内还没有可展示的站点分布。</p>'
      : `
          <ul class="domain-list">
            ${report.domains
              .slice(0, 6)
              .map(
                (domain) => `
                  <li class="domain-row">
                    <div class="domain-copy">
                      <strong>${escapeHtml(domain.domain)}</strong>
                      <span>${domain.readingMinutes} 分钟 · ${domain.reminderCount} 次提醒</span>
                    </div>
                    <strong class="domain-share">${Math.round(domain.readingShare * 100)}%</strong>
                  </li>
                `
              )
              .join('')}
          </ul>
        `;

  const reportBody = report.isEmpty
    ? '<p class="empty-state">最近这段时间还没有足够的数据，先去正常阅读一会儿，再回来生成报告。</p>'
    : `
        <div class="metrics report-metrics">
          <div class="metric"><div>总阅读</div><strong>${report.totalReadingMinutes} 分钟</strong></div>
          <div class="metric"><div>提醒次数</div><strong>${report.totalReminderCount} 次</strong></div>
          <div class="metric"><div>休息合规率</div><strong>${formatComplianceRate(report.complianceRate)}</strong></div>
          <div class="metric"><div>日均阅读</div><strong>${report.averageDailyReadingMinutes} 分钟</strong></div>
        </div>
        <div class="report-grid">
          <section class="report-card">
            <h3>最近 ${report.rangeDays} 天趋势</h3>
            <div class="trend-list">
              ${report.trend
                .map((point) => `
                  <div class="trend-row">
                    <span class="trend-date">${point.date.slice(5)}</span>
                    <div class="trend-bar-track">
                      <div class="trend-bar-fill" style="width: ${point.readingMinutes === 0 ? 0 : Math.max(6, (point.readingMinutes / maxReadingMinutes) * 100)}%"></div>
                    </div>
                    <span class="trend-value">${point.readingMinutes} 分钟</span>
                  </div>
                `)
                .join('')}
            </div>
          </section>
          <section class="report-card">
            <h3>站点分布</h3>
            ${domainMarkup}
          </section>
        </div>
      `;

  const reportStatus = report.isEmpty
    ? pdfExportEnabled
      ? '当前范围内暂无数据，仍可导出空报告页。'
      : '当前范围内暂无数据。免费版仅保留最近 7 天概览，PDF 导出需专业版。'
    : pdfExportEnabled
      ? '报告会基于当前范围实时生成，并导出为 PDF。'
      : '免费版仅展示最近 7 天趋势；升级专业版可导出 PDF 和查看最近 30 天。';

  return `
    <section class="report">
      <div class="section-header">
        <div>
          <h2>用眼健康报告</h2>
          <p>按当前 ${report.intervalMinutes} 分钟提醒规则估算最近 ${report.rangeDays} 天的休息合规情况。</p>
        </div>
        <div class="report-controls">
          <select id="report-range">
            <option value="7" ${report.rangeDays === 7 ? 'selected' : ''}>最近 7 天</option>
            <option value="30" ${report.rangeDays === 30 ? 'selected' : ''} ${thirtyDayEnabled ? '' : 'disabled'}>
              最近 30 天${thirtyDayEnabled ? '' : '（专业版）'}
            </option>
          </select>
          <button id="export-report" ${pdfExportEnabled ? '' : 'disabled'}>
            ${pdfExportEnabled ? '导出报告 PDF' : '导出报告 PDF（专业版）'}
          </button>
        </div>
      </div>
      <p id="report-status" class="settings-status">${reportStatus}</p>
      ${reportBody}
    </section>
  `;
}

async function render(settingsStatusMessage = '修改后会立即保存并同步到已启用站点。'): Promise<void> {
  if (runtimeStatusIntervalId !== null) {
    window.clearInterval(runtimeStatusIntervalId);
    runtimeStatusIntervalId = null;
  }

  const storage = new AppStorage();
  const state = await storage.loadState();
  const reportRangeDays = clampReportRangeDays(selectedReportRangeDays, state.plan);
  selectedReportRangeDays = reportRangeDays;
  const runtimeStatus = await resolveOptionsRuntimeStatus(state);
  const enabledSites = await loadEnabledSites();
  const viewModel = buildOptionsViewModel(state, runtimeStatus, today());
  const report = buildEyeCareReportModel(state.stats, state.settings, today(), reportRangeDays);
  const usesFixedInterval = getReminderCountdownSeconds(state.settings) !== null;
  const supportsCustomInterval = canUseCustomReminderInterval(state.plan);
  const selectedIntervalValue = getReminderIntervalSelectValue(state.settings, state.plan);
  const customIntervalValue = getCustomReminderIntervalValue(state.settings);
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
      <p data-status-explanation class="settings-status status-glance">${viewModel.statusExplanationLabel}</p>
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
          <div class="setting-inline">
            <select id="reminder-interval" ${usesFixedInterval ? 'disabled' : ''}>
              ${REMINDER_INTERVAL_OPTIONS.map((minutes) => {
                const selected = selectedIntervalValue === String(minutes) ? 'selected' : '';
                return `<option value="${minutes}" ${selected}>${minutes} 分钟</option>`;
              }).join('')}
              <option value="custom" ${selectedIntervalValue === 'custom' ? 'selected' : ''} ${supportsCustomInterval ? '' : 'disabled'}>
                ${supportsCustomInterval ? '自定义分钟数' : '自定义分钟数（专业版）'}
              </option>
            </select>
            <input
              id="reminder-interval-custom"
              type="number"
              min="${CUSTOM_REMINDER_INTERVAL_MINUTES_MIN}"
              max="${CUSTOM_REMINDER_INTERVAL_MINUTES_MAX}"
              step="1"
              value="${customIntervalValue}"
              ${usesFixedInterval || !supportsCustomInterval || selectedIntervalValue !== 'custom' ? 'disabled' : ''}
            />
          </div>
        </label>
        <p class="setting-note">${buildReminderModeDescription(state.settings)}</p>
        <p class="setting-note">
          ${supportsCustomInterval
            ? `标准提醒支持 15 / 20 / 30 分钟预设，也可以自定义 ${CUSTOM_REMINDER_INTERVAL_MINUTES_MIN}-${CUSTOM_REMINDER_INTERVAL_MINUTES_MAX} 分钟。`
            : '免费版标准提醒仅支持 15 / 20 / 30 分钟预设；自定义分钟数为专业版功能。'}
        </p>
        <p class="setting-note">${canUseBreakGuideAnimation(state.plan) ? '当前版本会展示休息引导动画。' : '免费版提醒期间会显示文字版休息引导。'}</p>
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
      ${buildReportMarkup(report, state.plan)}
      <section class="enabled-sites">
        <h2>已启用站点</h2>
        <p>这里展示通过 popup 单独授权过的站点，你可以随时撤销。</p>
        <div id="enabled-sites-list">
          ${buildEnabledSitesMarkup(enabledSites)}
        </div>
      </section>
      ${buildHealthNoticeMarkup()}
      ${buildRuntimeDiagnosticsMarkup(viewModel)}
      ${buildPlanPreviewMarkup(state.plan)}
      ${buildDataManagementMarkup()}
      <p>${buildReminderSummary(state.settings)}</p>
    </section>
  `;

  const readSettings = (): ReminderSettings =>
    sanitizeReminderSettingsForPlan(
      {
        reminderMode: parseReminderMode(
          (document.getElementById('reminder-mode') as HTMLSelectElement | null)?.value ?? state.settings.reminderMode
        ),
        reminderIntervalMinutes:
          ((document.getElementById('reminder-interval') as HTMLSelectElement | null)?.value ?? selectedIntervalValue) ===
          'custom'
            ? parseCustomReminderIntervalMinutes(
                (document.getElementById('reminder-interval-custom') as HTMLInputElement | null)?.value ??
                  String(customIntervalValue)
              )
            : parseReminderIntervalMinutes(
                (document.getElementById('reminder-interval') as HTMLSelectElement | null)?.value ??
                  String(state.settings.reminderIntervalMinutes)
              ),
        audioEnabled: Boolean((document.getElementById('audio-enabled') as HTMLInputElement | null)?.checked),
        fullscreenReminder: Boolean(
          (document.getElementById('fullscreen-reminder') as HTMLInputElement | null)?.checked
        )
      },
      state.plan
    );

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
    const runtimeListNode = document.getElementById('runtime-status-list');

    if (readingStatusNode) {
      readingStatusNode.textContent = latestViewModel.readingStatusLabel;
    }

    if (nextReminderNode) {
      nextReminderNode.textContent = latestViewModel.nextReminderLabel;
    }

    document.querySelectorAll<HTMLElement>('[data-status-explanation]').forEach((node) => {
      node.textContent = latestViewModel.statusExplanationLabel;
    });

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

  document.getElementById('subscription-plan')?.addEventListener('change', async (event) => {
    const plan = parseSubscriptionPlan((event.currentTarget as HTMLSelectElement).value);
    await storage.savePlan(plan);
    await render();
  });

  document.getElementById('audio-enabled')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('fullscreen-reminder')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('report-range')?.addEventListener('change', (event) => {
    const value = (event.currentTarget as HTMLSelectElement).value;
    selectedReportRangeDays = parseReportRangeDays(value);
    void render();
  });

  document.getElementById('reminder-interval-custom')?.addEventListener('change', () => {
    void persistSettings();
  });

  document.getElementById('export-report')?.addEventListener('click', async () => {
    const latest = await storage.loadState();
    const reportStatusNode = document.getElementById('report-status');
    const reportRangeDays = clampReportRangeDays(selectedReportRangeDays, latest.plan);

    if (!canUsePdfExport(latest.plan)) {
      if (reportStatusNode) {
        reportStatusNode.textContent = 'PDF 导出属于专业版功能，当前版本只保留页面内报告。';
      }
      return;
    }

    const latestReport = buildEyeCareReportModel(latest.stats, latest.settings, today(), reportRangeDays);

    try {
      const filename = await exportEyeCareReportPdf(latestReport);

      if (reportStatusNode) {
        reportStatusNode.textContent = latestReport.isEmpty
          ? `已导出空报告页：${filename}`
          : `报告 PDF 已导出：${filename}`;
      }
    } catch {
      if (reportStatusNode) {
        reportStatusNode.textContent = 'PDF 报告导出失败，请稍后重试。';
      }
    }
  });

  document.getElementById('export')?.addEventListener('click', async () => {
    const latest = await storage.loadState();
    const csv = exportBookStatsCsv(latest.stats);

    downloadCsv(buildExportFilename(today()), csv);
  });

  document.getElementById('reset')?.addEventListener('click', async () => {
    if (!shouldResetLocalData(window.confirm.bind(window))) {
      return;
    }

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
