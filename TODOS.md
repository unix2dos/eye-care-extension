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
