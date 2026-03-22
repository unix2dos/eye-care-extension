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

## Completed: Phase 3 休息引导动画

**What:** 在提醒面板里加入眼部放松引导动画，并在用户启用 `prefers-reduced-motion` 时退化成纯文字步骤。

**Why:** Phase 2 已经能强制用户停下来，但还只是“被打断”。Phase 3 需要把提醒升级成“可以直接跟着做”的休息动作，提高真实休息完成度。

**Context:** 现有 overlay 已经承载了全屏/紧凑提醒和 20 秒倒计时，最自然的接法是在 overlay 内部增加一个 guide 区，不改 scheduler / storage / popup 结构。

**Depends on:** Phase 2 完成。

**Added:** 2026-03-22 via implementation follow-up

**Completed:** 2026-03-22. 提醒面板现在会展示纯 SVG/CSS 的休息引导区，按倒计时节奏切换“远眺 / 左右转动 / 上下转动 / 深呼吸”步骤；如果系统偏好减少动态效果，则自动切成纯文字步骤列表。

## Completed: Phase 4 用眼健康报告

**What:** 在 Options 页面生成最近 `7 / 30` 天的用眼健康报告，包括阅读趋势、休息合规率、站点分布，并支持导出 PDF。

**Why:** 到了这一步，扩展不再只是“提醒你停下来”，而是开始把你的用眼行为变成一个可回顾、可携带的结果。这个能力也是后续付费模型和医生沟通场景的基础。

**Context:** 现有 stats 已经按日期和域名存储了阅读时长与提醒次数，足够先做一版基于当前提醒规则的报告。PDF 导出直接放在 options 页面执行，避开 MV3 service worker 的 DOM 限制。

**Depends on:** Phase 1 完成。

**Added:** 2026-03-22 via implementation follow-up

**Completed:** 2026-03-22. Options 页面现在支持最近 7 / 30 天报告切换，展示趋势、站点分布和休息合规率，并可以直接导出中文 PDF 报告；空数据时也会导出提示页而不是空白文件。

## Completed: Phase 5 Freemium 付费模型

**What:** 为扩展加入一层本地 entitlement / plan 模型，明确免费版与专业版的功能边界。

**Why:** Phase 2-4 已经把核心功能都做出来了，但哪些能力属于免费、哪些能力属于付费还只是设计文档里的定义。Phase 5 需要先把能力边界真正落到产品行为里，为后续接真实支付做准备。

**Context:** 当前不接入真实支付或订阅服务，只在 Options 页面提供一个本地版本预览切换。默认是免费版；专业版预览解锁动画引导、PDF 导出、最近 30 天趋势和标准模式自定义分钟数。

**Depends on:** Phase 3 + Phase 4 完成。

**Added:** 2026-03-22 via implementation follow-up

**Completed:** 2026-03-22. 现在持久化状态里包含 `plan`；免费版默认只显示最近 7 天报告、锁住 PDF 导出与自定义间隔，并把提醒面板降级成文字版休息引导；切到专业版预览后会解锁动画、最近 30 天趋势、PDF 导出和 `5-180` 分钟自定义标准提醒间隔。真实支付接入仍未实现。

## Completed: 上线前健康说明与隐私文案收口

**What:** 在 popup 和 Options 页面加入明确的健康说明，同时把隐私政策与 Chrome Web Store 表单答案更新到当前产品行为。

**Why:** 产品已经从“只支持微信读书”演进为“微信读书默认支持 + 其他站点按需启用 + 本地报告 + 本地版本预览”，但合规文案还停留在旧状态。上线前如果不收口，实际行为和政策说明会冲突。

**Context:** 不引入法律判断或医疗承诺，只做两个明确边界：一是扩展只提供日常休息提醒，不替代医生建议；二是所有统计、报告和版本预览都保留在浏览器本地。

**Depends on:** Phase 1-5 的实际能力已经稳定。

**Added:** 2026-03-22 via release-hardening follow-up

**Completed:** 2026-03-22. popup 新增简版健康说明，Options 新增“健康与隐私说明”区块；`PRIVACY.md` 和 `docs/store/chrome-web-store-form-answers.md` 已改到全站点按需授权、本地 CSV/PDF、本地版本预览和无远端上传的真实状态。
