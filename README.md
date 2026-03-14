# WeRead Eye Care

一个面向 `微信读书 Web` 的 Chrome 护眼提醒扩展。

WeRead Eye Care is a focused Chrome extension for WeRead Web. It tracks active reading time, triggers local break reminders, and keeps all settings and stats inside the current browser profile.

![WeRead Eye Care popup overview](docs/store/images/zh/01-popup.png)

## 概览

`WeRead Eye Care` 解决的是一个非常具体的问题：当你在微信读书网页里连续阅读时，如何在不引入摄像头、不依赖云服务的前提下，得到明确但克制的休息提醒。

扩展只在 `https://weread.qq.com/web/reader/*` 生效。它根据“活跃阅读时间”而不是自然时钟来累计计时，并在到达提醒间隔后通过页面提醒和内置语音提示你暂停一下。

## 核心能力

- `微信读书专用`
  只在微信读书阅读页工作，不干扰其他网站。
- `活跃阅读计时`
  只有页面可见、标签页在前台、且最近仍有阅读操作时才继续累计。
- `明确的休息提醒`
  支持全屏提醒或紧凑提醒，到点后直接在页面内提示休息。
- `内置固定语音`
  使用扩展自带音频，不依赖系统 `TTS` 或外部语音服务。
- `即时状态可见`
  `popup` 显示今日阅读、今日提醒、阅读状态和下次提醒倒计时，工具栏显示 `读 / 停` 状态。
- `本地统计与导出`
  统计保存在 `chrome.storage.local`，支持导出按日期和书名汇总的 CSV。

## 界面预览

### Popup 总览

![Popup overview](docs/store/images/zh/01-popup.png)

弹窗集中展示今日阅读、当前计时状态和下一次提醒倒计时，并提供提醒预览和设置入口。

### 设置页

![Options page](docs/store/images/zh/02-options.png)

设置页用于调整提醒间隔、语音开关和提醒呈现方式，同时支持导出本地 CSV 与清空统计。

### 全屏提醒

![Full-screen reminder](docs/store/images/zh/03-reminder.png)

当活跃阅读累计达到提醒间隔时，扩展会在页面内显示提醒遮罩，并播放内置语音提示。

## 工作方式

扩展当前采用一套简单且稳定的提醒模型：

1. 仅在微信读书阅读页识别阅读状态。
2. 当页面可见、标签页在前台，且最近 `3 分钟` 内有滚动、点击、按键或滚轮操作时，视为“活跃阅读”。
3. 只有处于活跃阅读状态时，才继续累计本轮阅读时间。
4. 达到设定间隔后触发提醒。

当前支持的提醒间隔：

- `15 分钟`
- `20 分钟`
- `30 分钟`

## 隐私与权限

这个项目的原则是：`本地优先、最小权限、只做提醒`。

- 不请求摄像头权限
- 不请求麦克风权限
- 不上传阅读数据到远端服务
- 不依赖云端语音服务
- 只申请 `storage` 和 `https://weread.qq.com/*` 所需权限

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

## 使用方式

1. 打开微信读书阅读页
2. 正常阅读，扩展会自动累计活跃阅读时间
3. 到达提醒间隔后，页面会显示提醒遮罩，并按设置决定是否播放语音
4. 点击扩展图标，可以查看当前阅读状态与下一次提醒倒计时
5. 如需调整提醒间隔、语音或提醒样式，打开设置页即可
6. 如需提前查看提醒效果，可直接使用 `popup` 里的 `预览提醒`

## 当前范围

- 只支持微信读书阅读页
- 默认提醒模型基于活跃阅读累计时间
- 当前 CSV 导出字段为 `date / bookTitle / readingMinutes / reminderCount`
- 当前不支持云同步、自定义提醒音频和多站点适配
