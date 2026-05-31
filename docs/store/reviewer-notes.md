# Chrome Web Store Reviewer Notes

这份说明用于 Chrome Web Store 审核备注，帮助审核员更快理解权限使用和本地预览行为。

## 中文备注

```text
审核说明：

1. 扩展默认只在微信读书阅读页 https://weread.qq.com/web/reader/* 工作。
2. 对其他网站，只有在 popup 中点击“在此站点启用护眼提醒”后，才会为当前站点申请权限并注入提醒脚本。
3. 扩展不会申请 all_urls，不会在未授权站点运行，也不会上传任何阅读数据。
4. Options 页面里的“专业版预览”只是本地功能锁态预览，用于验证动画引导、PDF 导出、30 天趋势和自定义间隔；它不是正式订阅，也不会处理支付信息。
5. 所有统计、报告和预览状态都只保存在 chrome.storage.local。

建议审核路径：

- 打开微信读书网页，可直接看到默认支持逻辑。
- 打开任意普通网页，在 popup 中启用当前站点后，可验证按站点授权。
- 打开 Options 页面，可验证提醒设置、健康报告、数据导出和本地专业版预览开关。
```

## English Note

```text
Reviewer notes:

1. The extension works on WeRead reader pages, https://weread.qq.com/web/reader/*, by default.
2. For other sites, it only requests host permission after the user clicks "Enable eye-care reminders on this site" in the popup for the current page.
3. It does not request all_urls, does not run on unauthorized sites, and does not upload reading data anywhere.
4. The "Pro preview" inside the Options page is a local feature-gating preview only. It is used to verify animation guidance, PDF export, 30-day reports, and custom intervals. It is not a live subscription flow and does not process payment information.
5. All stats, reports, and preview state remain inside chrome.storage.local.

Suggested review path:

- Open WeRead to verify the built-in default support.
- Open any normal http/https page and enable the current site from the popup to verify per-site permission requests.
- Open the Options page to verify reminder settings, reports, data export, and the local Pro preview toggle.
```
