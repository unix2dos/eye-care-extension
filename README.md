<!-- # WeRead Eye Care -->

一个支持 `微信读书默认启用 + 其他站点按需启用` 的 Chrome 护眼提醒扩展。

Eye Care Reminder is a Chrome extension that tracks active reading time, triggers local break reminders, and keeps all settings and stats inside the current browser profile.

![WeRead Eye Care popup overview](docs/store/images/zh/01-popup.png)

下载地址： https://chromewebstore.google.com/detail/weread-eye-care/ikcfjpodlbbmcemmbhokoenehlkhdegh

## 概览

`Eye Care Reminder` 解决的是一个具体的问题：当你在浏览器里持续阅读或用眼时，如何在不引入摄像头、不依赖云服务的前提下，得到明确但克制的休息提醒。

扩展在 `微信读书阅读页` 默认生效；在其他普通网页上，用户可以通过 popup 为当前站点单独授权启用。它根据“活跃阅读时间”而不是自然时钟来累计计时，并在到达提醒间隔后通过页面提醒和内置语音提示你暂停一下。默认模式是 `20-20-20` 法则，也保留了更轻量的标准提醒模式。

## 核心能力

- `微信读书默认支持 + 其他站点按需启用`
  微信读书阅读页开箱即用，其他站点只在你明确授权后才会工作。
- `活跃阅读计时`
  只有页面可见、标签页在前台、且最近仍有阅读操作时才继续累计。
- `明确的休息提醒`
  支持全屏提醒或紧凑提醒，到点后直接在页面内提示休息。
- `20-20-20 模式`
  默认每累计 `20 分钟` 活跃用眼后，要求看向 `20 英尺外` 至少 `20 秒`；关闭前会显示倒计时。
- `内置固定语音`
  使用扩展自带音频，不依赖系统 `TTS` 或外部语音服务。
- `即时状态可见`
  `popup` 显示今日阅读、今日提醒、阅读状态、状态解释和下次提醒倒计时，工具栏显示 `读 / 停` 状态。
- `本地统计与导出`
  统计保存在 `chrome.storage.local`，支持导出按日期、域名和书名汇总的 CSV。
- `已启用站点可管理`
  `Options` 页面可以查看并移除通过 popup 单独授权过的站点。

## 界面预览

### Popup 总览

![Popup overview](docs/store/images/zh/01-popup.png)

弹窗集中展示今日阅读、当前计时状态和下一次提醒倒计时，并提供当前站点启用、提醒预览和设置入口。

### 设置页

![Options page](docs/store/images/zh/02-options.png)

设置页用于切换提醒模式、调整标准模式间隔、控制语音和提醒呈现方式，同时支持导出本地 CSV、清空统计和管理已启用站点。

### 全屏提醒

![Full-screen reminder](docs/store/images/zh/03-reminder.png)

当活跃阅读累计达到提醒间隔时，扩展会在页面内显示提醒遮罩，并播放内置语音提示；在 `20-20-20` 模式下，关闭按钮会先经历 `20 秒` 倒计时。

## 工作方式

扩展当前采用一套简单且稳定的提醒模型：

1. 微信读书阅读页默认支持。
2. 其他普通网页需要先在 popup 中点击 `在此站点启用护眼提醒` 并授权当前站点。
3. 当页面可见、标签页在前台，且最近 `3 分钟` 内有滚动、点击、按键或滚轮操作时，视为“活跃阅读”。
4. 只有处于活跃阅读状态时，才继续累计本轮阅读时间。
5. 达到设定间隔后触发提醒。

当前支持两种提醒模式：

- `20-20-20`
  固定每 `20 分钟` 提醒一次，并要求看向远处至少 `20 秒`。
- `标准提醒`
  支持 `15 / 20 / 30 分钟` 间隔，提醒出现后可立即手动关闭。

## 隐私与权限

这个项目的原则是：`本地优先、最小权限、只做提醒`。

- 不请求摄像头权限
- 不请求麦克风权限
- 不上传阅读数据到远端服务
- 不依赖云端语音服务
- 默认只申请 `storage`、`scripting` 和 `https://weread.qq.com/*`
- 对其他网站的权限通过 popup 按站点动态申请，不一次性请求 `<all_urls>`

隐私政策见 [PRIVACY.md](PRIVACY.md)。

## 快速开始

```bash
npm install
npm run build
```

然后在 Chrome 中：

1. 打开 `chrome://extensions`
2. 开启 `开发者模式`
3. 点击 `加载已解压的扩展程序`
4. 选择 `dist/`

## 本地调试

### 运行测试

```bash
npm test -- --run
```

### TypeScript 类型检查

```bash
npx tsc --noEmit
```

### 开发流程

1. 修改 `src/` 下的代码
2. 运行 `npm run build` 重新构建
3. 在 `chrome://extensions` 页面点击扩展卡片上的刷新按钮
4. 刷新当前测试页面

### 调试 content script

1. 在已启用页面按 `F12` 打开 DevTools
2. 在 Console 中查看扩展日志
3. 检查提醒音频状态：
   ```js
   document.documentElement.dataset.wereadEyeCareReminderAudioStatus
   ```

### 调试 popup / options

1. 右键点击扩展图标 → `审查弹出内容`（popup）
2. 在 `chrome://extensions` 页面点击扩展的 `service worker` 链接查看 background 日志
3. 在 `chrome://extensions` 页面点击 `选项` 打开 options 页面后按 `F12`

### 调试 service worker (background)

1. 打开 `chrome://extensions`
2. 找到扩展卡片，点击 `Service Worker` 链接
3. 在打开的 DevTools 中查看 background 日志

## 使用方式

1. 打开微信读书阅读页，或打开任意普通网页后在 popup 中点击 `在此站点启用护眼提醒`
2. 正常阅读，扩展会自动累计活跃阅读时间
3. 到达提醒间隔后，页面会显示提醒遮罩，并按设置决定是否播放语音
4. 点击扩展图标，可以查看当前阅读状态与下一次提醒倒计时
5. `popup` 会额外解释当前为什么在计时，为什么暂停，或为什么当前站点尚未启用
6. 如需查看更完整的运行状态、管理已启用站点，或切换 `20-20-20 / 标准提醒`、调整语音和提醒样式，打开设置页即可
7. 如需提前查看提醒效果，可直接使用 `popup` 里的 `预览提醒`

## 当前范围

- 微信读书阅读页默认支持，其他站点按域名单独启用
- 默认提醒模型基于活跃阅读累计时间
- 默认模式为 `20-20-20`，同时保留标准提醒模式
- 当前 CSV 导出字段为 `date / domain / bookTitle / readingMinutes / reminderCount`
- 当前不支持云同步和自定义提醒音频
- 当前暂停原因优先级为：当前页未启用、页面不在前台、最近 3 分钟无阅读操作
