# TTS Voice And CSV Export Design

## Goal

在当前“无摄像头 + 活跃阅读提醒”的版本上，补两件缺口：

- 语音提醒尽量稳定地使用普通话 voice
- 在 `options` 页恢复一个极简 CSV 导出入口

## Scope

本次只做：

- 更稳的普通话 voice 选择
- 极简 CSV 导出
- README 同步到当前真实功能

本次不做：

- 自定义 voice
- 自定义提醒文案
- 恢复旧版眨眼率、恢复效果、策略等导出字段

## Approach

### 1. Voice Selection

当前 `TTS` 已经会设 `lang`，但浏览器仍可能选到非普通话 voice。新的策略是：

- 先等待 voice 列表可用
- 优先选 `zh-CN / cmn-CN`
- 再按名称偏好选更像普通话的 voice
- 最后才退回浏览器默认 voice

### 2. CSV Export

导出保持和无摄像头版本一致，只导出当前仍然真实存在的数据：

- `date`
- `bookTitle`
- `readingMinutes`
- `reminderCount`

入口放在 `options` 页，和 `清空本地统计` 并列。

### 3. README

README 明确说明：

- 当前有哪些功能
- 当前没有哪些旧功能
- 导出已恢复，但仅是极简 CSV
