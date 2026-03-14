# Privacy Policy

Last updated: 2026-03-14

`微信读书护眼 / WeRead Eye Care` is a Chrome extension built to remind users to take breaks while reading on WeRead Web.

This extension is designed around three principles:

- local-first
- minimal permissions
- reminder-only behavior

## English

### What the extension does

The extension works only on WeRead reading pages and uses active reading time to trigger reminders.

It can:

- detect whether the current WeRead reading tab is actively being used
- show reminder overlays inside the WeRead reading page
- play a bundled reminder audio clip
- save reminder settings and local reading statistics
- export local CSV summaries by date and book title

### What data is processed

The extension processes the following data locally in the current browser:

- active reading status
- reading duration
- reminder count
- current book title from the WeRead reading page
- reminder settings

### What permissions are used

- `storage`
  - Used to save reminder settings, reading state, and local statistics.
- `https://weread.qq.com/*`
  - Used only to detect reading activity on WeRead reading pages and to render reminders inside those pages.

### What the extension does not do

The extension does not:

- request camera access
- request microphone access
- upload reading history or reminder data to a remote server
- sell personal data
- share personal data with advertising partners
- use remote code or remote speech services for reminder playback

### Audio reminders

Reminder audio is bundled inside the extension package and is played locally. The extension does not rely on external text-to-speech services.

### Data retention

All reminder settings and reading statistics stay in the current Chrome profile unless the user clears them manually or exports CSV data locally.

### Contact

Repository: [https://github.com/unix2dos/eye-care-extension](https://github.com/unix2dos/eye-care-extension)

## 中文

### 扩展做什么

本扩展只在微信读书网页版阅读页生效，根据活跃阅读时间触发护眼提醒。

它会：

- 判断当前微信读书阅读标签页是否处于活跃阅读状态
- 在微信读书阅读页内显示提醒遮罩
- 播放扩展内置的提醒语音
- 保存提醒设置和本地阅读统计
- 导出按日期和书名汇总的本地 CSV 数据

### 会处理哪些数据

扩展只在当前浏览器本地处理以下数据：

- 活跃阅读状态
- 阅读时长
- 提醒次数
- 当前微信读书页面的书名
- 提醒设置

### 使用哪些权限

- `storage`
  - 用于保存提醒设置、阅读状态和本地统计。
- `https://weread.qq.com/*`
  - 仅用于识别微信读书阅读页中的阅读活动，并在这些页面内显示提醒。

### 不会做什么

本扩展不会：

- 请求摄像头权限
- 请求麦克风权限
- 将阅读历史或提醒数据上传到远端服务器
- 出售个人数据
- 向广告合作方共享个人数据
- 使用远程代码或远程语音服务播放提醒

### 语音提醒

提醒语音作为扩展内置音频文件随安装包一起分发，并在本地播放，不依赖外部语音服务。

### 数据保留

所有提醒设置和阅读统计都只保存在当前 Chrome 配置中，除非用户手动清空或导出本地 CSV 数据。

### 联系方式

仓库地址：[https://github.com/unix2dos/eye-care-extension](https://github.com/unix2dos/eye-care-extension)
