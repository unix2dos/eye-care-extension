# Chrome Web Store Assets

This folder contains the localized Chrome Web Store listing copy and the store-ready screenshots for `护眼提醒扩展 / Eye Care Reminder`.

## Deliverables

- Localized listing copy:
  - Chinese default
  - English localized
- Privacy disclosure copy:
  - Chinese default
  - English localized
- Store screenshots:
  - `1280x800`
  - `24-bit PNG`
  - no alpha channel

The repository keeps the final PNG screenshots. The intermediate HTML fixtures are generated on demand and are intentionally not tracked.

## Screenshot Assets

### Chinese

1. `docs/store/images/zh/01-popup.png`
2. `docs/store/images/zh/02-options.png`
3. `docs/store/images/zh/03-reminder.png`
4. `docs/store/images/zh/04-toolbar.png`

### English

1. `docs/store/images/en/01-popup.png`
2. `docs/store/images/en/02-options.png`
3. `docs/store/images/en/03-reminder.png`
4. `docs/store/images/en/04-toolbar.png`

## Chinese Default Listing

### Store Name

护眼提醒扩展

### Short Description

微信读书默认支持，普通网页按站点启用。按活跃用眼时间提醒休息，支持 20-20-20、健康报告和本地导出。

### Long Description

护眼提醒扩展是一个本地优先的浏览器护眼助手。微信读书阅读页开箱即用，其他普通网页只有在你主动授权当前站点后才会工作。

它不会索要摄像头权限，也不会分析你的面部状态。扩展只根据当前页面里的活跃用眼时间来判断什么时候提醒你休息，让提醒足够明确，但不过度打扰。

你可以随时打开弹窗，看到今天阅读了多久、今天已经提醒了几次，以及距离下一次提醒还有多久。扩展还会在工具栏上直接显示“读 / 停”状态，不用打开弹窗，也能知道当前是否还在计时。

当前默认模式是 `20-20-20`：每累计 `20 分钟` 活跃用眼后，提醒你看向 `20 英尺外` 至少 `20 秒`。如果你更偏好轻量提醒，也可以切换到标准提醒模式。提醒可以全屏，也可以缩成右下角卡片，并支持扩展内置语音。

设置页还会生成本地用眼健康报告：最近 `7 天` 基础趋势对所有用户开放，专业版能力预览可解锁最近 `30 天` 趋势、PDF 导出、动画引导和自定义标准提醒间隔。

主要功能：

- 微信读书默认支持，普通网页按站点单独启用
- 按活跃阅读时间提醒，而不是按自然时钟机械提醒
- 默认支持 `20-20-20` 模式，也保留标准提醒
- 免费版支持 `15 / 20 / 30` 分钟预设；专业版能力预览可自定义分钟数
- 支持内置固定语音提醒
- 支持全屏提醒和紧凑提醒
- 支持最近 `7 / 30` 天健康报告
- 支持导出本地 CSV / PDF 报告
- 弹窗里直接显示本轮计时和下次提醒倒计时
- 工具栏显示“读 / 停”状态
- 统计和设置仅保存在当前浏览器本地
- popup 和设置页都明确提示健康说明，不替代医生建议

适合谁：

- 主要在 Chrome 里长时间阅读、写作或查资料的人
- 想要一个简单、低权限、低配置的护眼提醒工具的人
- 不想使用摄像头，也不想把阅读数据上传到云端的人

### Privacy Disclosure

护眼提醒扩展的设计原则是“本地优先、最小权限、只做提醒”。

它只请求并使用以下权限：

- `storage`：保存提醒设置、本地统计和本地版本预览状态
- `scripting`：在用户已授权站点注入提醒脚本
- `https://weread.qq.com/*`：微信读书默认支持
- 对其他 `http/https` 网站，只会在用户主动点击启用后为当前站点申请权限

它不会做这些事：

- 不请求摄像头
- 不请求麦克风
- 不上传阅读记录到远端服务器
- 不同步个人阅读数据到云端
- 不出售或共享个人数据给第三方广告商

本地保存的数据包括：

- 今日阅读时长
- 今日提醒次数
- 当前本轮计时
- 本地提醒设置
- 按日期、域名和书名汇总的统计
- 本地健康报告和版本预览所需状态

提醒语音使用扩展内置音频资源，不依赖外部语音服务。

健康说明：本扩展只提供日常休息提醒，不替代医生诊疗或处方方案；如果医生给了更具体的用眼计划，请优先遵循医生建议。

### Screenshot Captions

1. Popup 总览
   - 标题：默认支持微信读书，也能按站点扩展到普通网页
   - 说明：今日阅读、状态解释和下次提醒都集中在一个轻量面板里。
2. 设置页
   - 标题：把设置、报告和数据管理分成清晰层级
   - 说明：首屏先处理提醒设置和健康报告，数据管理与站点管理放到下面。
3. 全屏提醒
   - 标题：20-20-20 会带着你完成一个真正的短休息
   - 说明：倒计时结束前不能关闭，并按步骤提示远眺、转动视线和呼吸放松。
4. 工具栏状态
   - 标题：不用打开弹窗，也知道当前标签页是否还在计时
   - 说明：已启用站点活跃阅读时显示“读”，暂停或未计时时显示“停”。

## English Localized Listing

### Store Name

Eye Care Reminder

### Short Description

WeRead is supported by default, and other sites can be enabled one by one. Tracks active reading time, supports 20-20-20, and keeps reports local.

### Long Description

Eye Care Reminder is a local-first break reminder for long reading and screen sessions. WeRead reading pages work out of the box, and other sites can be enabled only after the user grants permission for that site.

It does not ask for camera access and it does not analyze your face. The extension uses active reading time inside the current page to decide when to remind you to pause, keeping the experience clear and lightweight.

Open the popup at any time to check how long you have read today, how many reminders you have already received, and how long it is until the next break. The toolbar badge also shows a simple read or pause state, so you can tell at a glance whether the timer is still running.

The default mode follows the 20-20-20 rule: after every 20 minutes of active reading, the extension asks you to look into the distance for 20 seconds. A lighter standard reminder mode is also available. The Options page can generate local eye-care reports, and the current free/pro switch is only a local feature-preview toggle, not a live billing system.

Key features:

- WeRead support by default, plus site-by-site enablement for other pages
- Uses active reading time instead of a rigid wall clock timer
- Built-in 20-20-20 mode and a lighter standard reminder mode
- Bundled local voice reminder instead of system TTS
- Full-screen and compact reminder styles
- Local 7-day and 30-day eye-care report views
- Local CSV and PDF exports
- Popup countdown and toolbar read/pause state
- Local-only storage for settings, reading stats, and report inputs

Best for:

- People who spend long sessions reading or working in Chrome
- Users who want a lightweight eye-care reminder without camera-based tracking
- Anyone who wants local-only stats and reports instead of cloud sync

### Privacy Disclosure

Eye Care Reminder is designed around three principles: local-first, minimal permissions, and reminder-only behavior.

The extension only uses these permissions:

- `storage`: save reminder preferences, local reading stats, and the local free/pro preview state
- `scripting`: inject reminder logic into sites that the user has already enabled
- `https://weread.qq.com/*`: built-in WeRead support
- optional `http/https` host permissions: requested only for the current site after the user clicks enable

What the extension does not do:

- It does not request camera access
- It does not request microphone access
- It does not upload reading history to a remote server
- It does not sync personal reading data to the cloud
- It does not sell or share personal data with advertising partners

Data stored locally includes:

- today reading time
- today reminder count
- the current session timer
- local reminder settings
- per-day, per-domain, and per-book stats used for local reports and exports
- the local free/pro preview state used for feature-gating tests

Reminder audio is bundled inside the extension and does not depend on any external speech service.

Health notice: this extension is a daily break-reminder tool only and does not replace diagnosis, prescriptions, or treatment plans from a medical professional.

### Screenshot Captions

1. Popup Overview
   - Title: WeRead works immediately, and any normal page can be enabled site by site
   - Copy: Reading time, status reasoning, and the next break all stay visible in one small panel.
2. Settings
   - Title: Settings, reports, and data actions now live in a clearer hierarchy
   - Copy: Reminder controls stay on top, while reports and raw-data actions are grouped below.
3. Full-screen Reminder
   - Title: The 20-20-20 flow guides a real short break
   - Copy: A countdown, guided steps, and a delayed close button make the break harder to skip.
4. Toolbar Badge
   - Title: Know whether the current tab is still counting without opening the popup
   - Copy: Enabled active tabs show READ; paused or stopped tabs show PAUSE.

## Regenerate Screenshots

Run:

```bash
node scripts/generate-store-assets.mjs
```

The command rewrites:

- `docs/store/fixtures/zh/*.html`
- `docs/store/fixtures/en/*.html`
- `docs/store/images/zh/*.png`
- `docs/store/images/en/*.png`
