# Chrome Web Store Assets

This folder contains the localized Chrome Web Store listing copy and the store-ready screenshots for `微信读书护眼 / WeRead Eye Care`.

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

微信读书护眼

### Short Description

微信读书专用护眼提醒扩展。按活跃阅读时间提醒休息，支持语音、全屏提醒、倒计时和读停状态标记。

### Long Description

微信读书护眼是一个专门为微信读书 Web 版设计的护眼提醒扩展。

它不会索要摄像头权限，也不会分析你的面部状态。扩展只根据你在微信读书阅读页中的活跃阅读时间来判断什么时候提醒你休息，让提醒足够明确，但不过度打扰。

你可以在阅读时随时打开弹窗，看到今天阅读了多久、今天已经提醒了几次，以及距离下一次提醒还有多久。扩展还会在工具栏上直接显示“读 / 停”状态，不用打开弹窗，也能知道当前是否还在计时。

当活跃阅读累计达到提醒间隔时，扩展会直接弹出提醒。你可以选择全屏提醒，让页面先停下来；也可以保留语音提醒，让扩展播放内置语音：“请休息一下，眨眼几次，再看远处十秒。”

主要功能：

- 只在微信读书阅读页生效，不打扰其他网站
- 按活跃阅读时间提醒，而不是按自然时钟机械提醒
- 支持 15 / 20 / 30 分钟提醒间隔
- 支持内置固定语音提醒
- 支持全屏提醒和紧凑提醒
- 弹窗里直接显示本轮计时和下次提醒倒计时
- 工具栏显示“读 / 停”状态
- 统计和设置仅保存在当前浏览器本地
- 支持导出按天、按书名汇总的 CSV 数据

适合谁：

- 主要在 Chrome 里使用微信读书 Web 版阅读的人
- 想要一个简单、低权限、低配置的护眼提醒工具的人
- 不想使用摄像头，也不想把阅读数据上传到云端的人

### Privacy Disclosure

微信读书护眼的设计原则是“本地优先、最小权限、只做提醒”。

它只请求并使用以下权限：

- `storage`：保存提醒设置和本地阅读统计
- `https://weread.qq.com/*`：仅在微信读书阅读页识别阅读状态与显示提醒

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
- 导出所需的按天 / 按书名阅读统计

提醒语音使用扩展内置音频资源，不依赖外部语音服务。

### Screenshot Captions

1. Popup 总览
   - 标题：打开弹窗，马上看到阅读节奏
   - 说明：今日阅读、当前计时和下次提醒倒计时都集中在一个轻量面板里。
2. 设置页
   - 标题：把提醒节奏调到顺手
   - 说明：提醒间隔、语音开关和全屏提醒都能在设置页直接调整。
3. 全屏提醒
   - 标题：到点后直接打断阅读，提醒你休息
   - 说明：提醒不会自动消失，必须手动确认后才会恢复页面交互。
4. 工具栏状态
   - 标题：不用打开弹窗，也知道现在是在读还是已停
   - 说明：当前活动标签页处于阅读中时显示“读”，暂停时显示“停”。

## English Localized Listing

### Store Name

WeRead Eye Care

### Short Description

A break reminder built for WeRead Web. Tracks active reading time, plays bundled voice reminders, shows countdowns, and surfaces read or pause status.

### Long Description

WeRead Eye Care is a focused break reminder built specifically for WeRead Web.

It does not ask for camera access and it does not analyze your face. The extension only uses your active reading time inside the WeRead reading page to decide when to remind you to pause, keeping the experience clear and lightweight.

Open the popup at any time to check how long you have read today, how many reminders you have already received, and how long it is until the next break. The toolbar badge also shows a simple read or pause state, so you can tell at a glance whether the timer is still running.

When your active reading session reaches the configured interval, the extension shows a break reminder right away. You can keep the full-screen reminder enabled to interrupt the page on purpose, and you can use the bundled voice reminder that says: “Take a short break, blink a few times, and look into the distance for ten seconds.”

Key features:

- Works only on WeRead reading pages
- Uses active reading time instead of a rigid wall clock timer
- Supports 15, 20, or 30 minute reminder intervals
- Plays a bundled voice reminder instead of relying on system TTS
- Supports full-screen and compact reminder styles
- Shows the live session timer and next break countdown in the popup
- Displays a toolbar badge for reading and pause state
- Stores settings and reading stats locally in the current browser
- Exports CSV summaries by date and book title

Best for:

- People who read primarily on WeRead Web in Chrome
- Readers who want a lightweight eye-care reminder without extra permissions
- Anyone who does not want camera-based fatigue tracking or cloud sync

### Privacy Disclosure

WeRead Eye Care is designed around three principles: local-first, minimal permissions, and reminder-only behavior.

The extension only uses these permissions:

- `storage`: save reminder preferences and local reading stats
- `https://weread.qq.com/*`: detect reading activity and render reminders on WeRead reading pages only

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
- per-day and per-book stats used for CSV export

Reminder audio is bundled inside the extension and does not depend on any external speech service.

### Screenshot Captions

1. Popup Overview
   - Title: Open the popup and read the room instantly
   - Copy: See today’s reading time, the live session timer, and your next break countdown in one glance.
2. Settings
   - Title: Tune the reminder flow to your own pace
   - Copy: Adjust the interval, voice playback, and full-screen reminders without leaving the extension.
3. Full-screen Reminder
   - Title: A break overlay that is hard to ignore
   - Copy: The reminder covers the page until you acknowledge it, so the break actually happens.
4. Toolbar Badge
   - Title: Know whether you are reading or paused without opening the popup
   - Copy: The active tab shows a read badge while counting and a pause badge when it stops.

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
