# Privacy Policy

Last updated: 2026-03-22

`Eye Care Reminder / 护眼提醒扩展` is a Chrome extension for local break reminders and eye-care reporting while you read on WeRead or on other sites that you explicitly enable.

This extension is designed around three principles:

- local-first
- minimal permissions
- reminder-only behavior

## English

### What the extension does

The extension:

- works on WeRead reading pages by default
- can be enabled on other `http/https` sites only after the user explicitly grants host permission for that site
- detects active reading time from local page activity such as scroll, click, keydown, wheel, tab visibility, and foreground state
- shows reminder overlays inside the current page
- plays a bundled reminder audio clip locally
- stores reminder settings, local statistics, and the local free/pro preview state in `chrome.storage.local`
- generates CSV and PDF exports locally inside the browser

### What data is processed

The extension processes the following data locally in the current browser profile:

- active reading status
- reading duration
- reminder count
- current site domain
- current WeRead book title when available
- reminder settings
- locally generated report summaries
- local plan preview selection used for free/pro feature gating tests

### What permissions are used

- `storage`
  - Used to save reminder settings, reading state, local statistics, and the local free/pro preview state.
- `scripting`
  - Used to inject the content script into sites that the user has already enabled.
- `https://weread.qq.com/*`
  - Used for built-in WeRead support.
- optional host permissions for `http://*/*` and `https://*/*`
  - Requested only when the user clicks the enable button for the current site in the popup.

### What the extension does not do

The extension does not:

- request camera access
- request microphone access
- upload reading history, reminder data, reports, or settings to a remote server
- sell personal data
- share personal data with advertising partners
- use remote code
- use remote text-to-speech or remote audio services
- perform medical diagnosis, treatment, or health evaluation

### Audio reminders

Reminder audio is bundled inside the extension package and is played locally. The extension does not rely on external speech services.

### Reports and exports

CSV and PDF exports are generated locally in the browser. Exported files are only written to the user’s device when the user explicitly clicks export.

### Local plan preview

The current free/pro switch in the Options page is a local preview used to test feature gating. It does not create an account, process payment information, or contact a billing service.

### Data retention

All reminder settings, statistics, report inputs, and local preview state stay in the current Chrome profile unless the user clears them manually, removes the extension, or exports files locally.

### Medical notice

The extension is a daily break-reminder tool only. It does not replace medical diagnosis, prescriptions, or treatment plans. If a doctor gives a more specific eye-care routine, the doctor’s instructions should take priority.

### Contact

Repository: [https://github.com/unix2dos/eye-care-extension](https://github.com/unix2dos/eye-care-extension)

## 中文

### 扩展做什么

本扩展：

- 默认支持微信读书网页版阅读页
- 对其他 `http/https` 网站，只有在用户通过 popup 明确授权当前站点后才会生效
- 根据滚动、点击、按键、滚轮、页面可见性和前后台状态，在本地判断是否处于活跃用眼状态
- 在当前页面内显示提醒遮罩
- 在本地播放扩展内置提醒语音
- 将提醒设置、本地统计和本地免费版/专业版预览状态保存到 `chrome.storage.local`
- 在浏览器本地生成 CSV 和 PDF 导出文件

### 会处理哪些数据

扩展只在当前浏览器配置中本地处理以下数据：

- 活跃用眼状态
- 阅读时长
- 提醒次数
- 当前站点域名
- 微信读书页面可识别到的书名
- 提醒设置
- 本地生成报告所需的统计汇总
- 用于验证免费版/专业版锁态的本地版本预览选择

### 使用哪些权限

- `storage`
  - 用于保存提醒设置、阅读状态、本地统计和本地版本预览状态。
- `scripting`
  - 用于把 content script 注入到用户已经授权的站点。
- `https://weread.qq.com/*`
  - 用于内置的微信读书支持。
- `http://*/*` 与 `https://*/*` 的可选主机权限
  - 只有当用户在 popup 里主动点击“在此站点启用护眼提醒”时，才会为当前站点申请。

### 不会做什么

本扩展不会：

- 请求摄像头权限
- 请求麦克风权限
- 将阅读历史、提醒数据、报告内容或设置上传到远端服务器
- 出售个人数据
- 向广告合作方共享个人数据
- 使用远程代码
- 使用远程语音或远程音频服务
- 进行医疗诊断、治疗或健康评估

### 语音提醒

提醒语音作为扩展内置音频文件随安装包一起分发，并在本地播放，不依赖任何外部语音服务。

### 报告与导出

CSV 和 PDF 都在浏览器本地生成。只有当用户主动点击导出按钮时，文件才会写入用户设备。

### 本地版本预览

当前 Options 页里的免费版/专业版切换只是本地预览，用于验证功能锁态；它不会创建账号，也不会处理支付信息，更不会连接计费服务。

### 数据保留

所有提醒设置、本地统计、报告输入数据和本地版本预览状态都只保存在当前 Chrome 配置中，除非用户手动清空、卸载扩展，或主动导出本地文件。

### 健康说明

本扩展只提供日常休息提醒，不替代医生诊疗、处方或治疗方案。如果医生给了更具体的用眼计划，请优先遵循医生建议。

### 联系方式

仓库地址：[https://github.com/unix2dos/eye-care-extension](https://github.com/unix2dos/eye-care-extension)
