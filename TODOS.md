# TODOS

## Completed: Popup 受限页面检测

**What:** 为 popup 中的"启用护眼提醒"按钮增加受限页面检测——`chrome://`、`chrome-extension://`、`about:` 等页面不应显示启用按钮。

**Why:** 用户在这些页面点击扩展图标时，如果显示"启用"按钮并允许点击，`chrome.scripting.executeScript` 会报错。应在 UI 层直接禁用。

**Context:** MV3 扩展不能注入 `chrome://`、`edge://`、`about:blank` 等受限 URL。popup 在渲染时检查 `activeTab.url` 的 scheme，如果是受限 URL 则不显示启用按钮。

**Depends on:** Phase 1 popup 启用流程完成。

**Added:** 2026-03-22 via /plan-eng-review

**Completed:** 2026-03-22 in Phase 1 popup enable flow. 现在仅 `http/https` 页面会显示启用按钮，`chrome://`、`chrome-extension://`、`about:` 等受限页面不会再提供启用入口。

## Completed: Options 已启用站点列表管理

**What:** Options 页增加"已启用站点列表"管理界面，允许用户查看和移除已授权的站点。

**Why:** 用户通过 popup 逐个启用站点后，需要一个集中的地方查看和管理。`chrome.permissions.getAll()` 可以获取已授权的主机列表，`chrome.permissions.remove()` 可以撤销。

**Context:** Phase 1 的 popup 驱动启用流程只负责"添加"，"管理和移除"可以作为 Phase 1 的后续小迭代。约 50-80 行代码。

**Depends on:** Phase 1 完成。

**Added:** 2026-03-22 via /plan-eng-review

**Completed:** 2026-03-22. Options 页面现在可以列出通过 popup 单独授权的站点，并调用 `chrome.permissions.remove()` 撤销授权；默认 WeRead 站点不会出现在可移除列表里。

## Completed: Phase 2 20-20-20 提醒模式

**What:** 在现有提醒模型上新增 `20-20-20` 模式，默认按 `20 分钟` 活跃阅读触发提醒，并要求用户看向远处 `20 秒`；同时保留可配置间隔的标准提醒模式。

**Why:** 这是设计文档里定义的核心价值主张。相比“到点提醒一下”，`20-20-20` 更接近真实的护眼行为闭环。

**Context:** 现有架构已经有稳定的活跃阅读计时、overlay 和 preview 流程，只需要在设置层新增模式，并把 `20 秒` 倒计时注入真实提醒和预览提醒。

**Depends on:** Phase 1 完成。

**Added:** 2026-03-22 via implementation follow-up

**Completed:** 2026-03-22. Options 页面现在支持 `20-20-20 / 标准提醒` 两种模式切换；`20-20-20` 模式下固定每 20 分钟触发提醒，真实提醒和预览提醒都会带 20 秒倒计时，全屏和紧凑提醒都走同一套行为。
