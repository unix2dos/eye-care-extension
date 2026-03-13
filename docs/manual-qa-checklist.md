# WeRead Eye Care 手工验收清单

## 1. 构建与加载

1. 在项目根目录运行：

```bash
npm install
npm test -- --run
npx tsc --noEmit
npm run build
```

2. 打开 `chrome://extensions`
3. 开启 `开发者模式`
4. 点击 `加载已解压的扩展程序`
5. 选择项目里的 `dist/`

验收标准：

- 扩展可以正常加载
- 没有 manifest 错误
- popup 可以打开
- options 页面可以打开

## 2. 不请求摄像头

1. 打开任意非微信读书页面
2. 再打开微信读书阅读页 `https://weread.qq.com/web/reader/...`
3. 观察整个过程中是否出现摄像头权限请求

验收标准：

- 不应出现摄像头权限请求
- 不应出现视觉检测、校准或模式切换相关文案

## 3. 微信读书页面识别

1. 打开一个非微信读书页面
2. 点击扩展图标
3. 再切到微信读书阅读页，重新打开 popup

验收标准：

- 非微信读书页时，`预览提醒` 按钮置灰
- 非微信读书页时，popup 显示 `等待开始阅读`
- 微信读书阅读页时，`预览提醒` 按钮可用

## 4. 预览提醒

1. 打开一个微信读书阅读页
2. 点击 popup 中的 `预览提醒`

验收标准：

- 当前阅读页出现全屏提醒遮罩
- 底层页面不能继续点击或滚动
- 会尝试播报 `TTS`
- 预览不会自动消失
- 必须点击 `我知道了` 才会关闭
- 今日提醒次数不增加
- 下次提醒时间不变化

## 5. 活跃阅读累计

1. 打开微信读书阅读页
2. 保持标签页在前台
3. 每隔一段时间做一次滚动、点击、按键或滚轮操作
4. 打开 popup 观察状态

验收标准：

- 阅读状态显示 `正在累计阅读`
- 下次提醒显示一个具体时间
- 今日阅读时长会逐步增加

## 6. 非活跃暂停

1. 在微信读书阅读页累计几分钟阅读后
2. 切到其他标签页，或让当前页超过 `3 分钟` 没有任何操作
3. 打开 popup

验收标准：

- 阅读状态变为 `等待开始阅读`
- 下次提醒显示 `等待开始阅读`
- 不应继续累计阅读时间

## 7. 20 分钟真实提醒

1. 在微信读书阅读页保持活跃阅读累计达到 `20 分钟`
2. 观察页面提醒

验收标准：

- 页面出现全屏提醒遮罩
- 底层页面不能继续点击或滚动
- 语音文案为：`请休息一下，眨眼几次，再看远处十秒。`
- 提醒出现后，下一轮累计重新开始
- popup 中的今日提醒次数加 `1`

## 8. 累计暂停后继续

1. 先活跃阅读 `10 分钟`
2. 切走标签页 `5 分钟`
3. 回来继续活跃阅读 `10 分钟`

验收标准：

- 切走期间不累计
- 回来继续读满第二个 `10 分钟` 后触发提醒

## 9. TTS 失败时的退化

如果你能方便制造 `speechSynthesis` 不可用的场景，执行：

1. 打开微信读书阅读页
2. 触发一次预览提醒，或等待真实提醒

验收标准：

- 页面全屏提醒仍会出现
- 不会自动退回到普通提示音
- 扩展不会因为 TTS 失败而报错或停止计时

## 10. TTS Voice 选择

1. 打开微信读书阅读页
2. 点击 `预览提醒`
3. 在页面 DevTools Console 中检查：

```js
document.documentElement.dataset.wereadEyeCarePreferredVoiceName
document.documentElement.dataset.wereadEyeCareSelectedVoiceName
document.documentElement.dataset.wereadEyeCareSelectedVoiceLang
document.documentElement.dataset.wereadEyeCareVoiceSelectionKind
document.documentElement.dataset.wereadEyeCareVoiceFallbackUsed
```

验收标准：

- 首选 voice 为 `Eddy（中文·中国大陆）`
- 如果浏览器里存在这个 voice，`SelectedVoiceName` 应对应 `Eddy`
- 如果它不存在，`SelectedVoiceLang` 仍应是 `zh-CN`
- `SelectionKind` 应能区分是首选命中还是 fallback
## 11. Options 状态页

1. 打开扩展选项页

验收标准：

- 只显示极简统计和状态
- 至少包含：
  - 今日阅读
  - 今日提醒
  - 阅读状态
  - 下次提醒
  - 导出 CSV
- 不再出现：
  - 摄像头
  - 视觉检测
  - 校准
  - 策略切换

## 12. 清空数据

1. 在扩展选项页点击 `清空本地统计`
2. 返回 popup 再查看状态

验收标准：

- 今日阅读时长清零
- 今日提醒次数清零
- 当前累计状态清零
- 重新开始阅读后，从新的累计周期开始

## 13. CSV 导出

1. 在扩展选项页点击 `导出 CSV`
2. 打开下载得到的文件

验收标准：

- 会下载一个 `.csv` 文件
- 文件名形如 `weread-eye-care-YYYY-MM-DD.csv`
- 表头固定为：
  - `date`
  - `bookTitle`
  - `readingMinutes`
  - `reminderCount`
- 不包含摄像头、眨眼率或恢复效果相关字段

## 14. 回归关注点

重点观察这些风险：

- popup 的下次提醒时间是否和实际累计节奏一致
- 页面隐藏或切标签页后是否真的暂停
- 预览提醒是否误计入真实提醒次数
- TTS 在你的 Chrome 环境里是否稳定播报普通话
