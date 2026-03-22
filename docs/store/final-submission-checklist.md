# Chrome Web Store Final Submission Checklist

这份清单只服务最后一次商店提交。目标是让你在 Chrome Web Store 后台按顺序完成上传，不用再翻多个文档。

## 1. 上传包

优先上传：

- [eye-care-reminder-2.0.0-store.zip](/Users/liuwei/workspace/eye-care-extension/release/eye-care-reminder-2.0.0-store.zip)
- SHA-256：`e3e7ab5df3322587c9d89b21e9c42d08b72a67aad5aa505c192af216b4280307`

归档备用：

- [eye-care-reminder-2.0.0-chrome.zip](/Users/liuwei/workspace/eye-care-extension/release/eye-care-reminder-2.0.0-chrome.zip)
- SHA-256：`917bf97d8a21ddd992afd7a43f5224e5253dc470c6ba8f6687b73ba22390205d`

校验文件：

- [SHA256SUMS.txt](/Users/liuwei/workspace/eye-care-extension/release/SHA256SUMS.txt)

## 2. 商店名称与简介

中文默认：

- 店铺名：`护眼提醒扩展`
- 短描述：见 [copy-paste-pack.md](/Users/liuwei/workspace/eye-care-extension/docs/store/copy-paste-pack.md)
- 长描述：见 [copy-paste-pack.md](/Users/liuwei/workspace/eye-care-extension/docs/store/copy-paste-pack.md)

英文本地化：

- Store Name: `Eye Care Reminder`
- Short Description: see [copy-paste-pack.md](/Users/liuwei/workspace/eye-care-extension/docs/store/copy-paste-pack.md)
- Long Description: see [copy-paste-pack.md](/Users/liuwei/workspace/eye-care-extension/docs/store/copy-paste-pack.md)

更新说明：

- 中文 / 英文短版与长版都在 [release-notes-next.md](/Users/liuwei/workspace/eye-care-extension/docs/release-notes-next.md)
- 如需直接复制短版，也可用 [copy-paste-pack.md](/Users/liuwei/workspace/eye-care-extension/docs/store/copy-paste-pack.md)

## 3. 截图素材

中文：

1. [01-popup.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/zh/01-popup.png)
2. [02-options.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/zh/02-options.png)
3. [03-reminder.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/zh/03-reminder.png)
4. [04-toolbar.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/zh/04-toolbar.png)

英文：

1. [01-popup.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/en/01-popup.png)
2. [02-options.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/en/02-options.png)
3. [03-reminder.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/en/03-reminder.png)
4. [04-toolbar.png](/Users/liuwei/workspace/eye-care-extension/docs/store/images/en/04-toolbar.png)

说明文案：

- 标题和截图 caption 见 [chrome-web-store-assets.md](/Users/liuwei/workspace/eye-care-extension/docs/store/chrome-web-store-assets.md)

## 4. 权限与隐私表单

直接参考：

- [chrome-web-store-form-answers.md](/Users/liuwei/workspace/eye-care-extension/docs/store/chrome-web-store-form-answers.md)
- [PRIVACY.md](/Users/liuwei/workspace/eye-care-extension/PRIVACY.md)
- [reviewer-notes.md](/Users/liuwei/workspace/eye-care-extension/docs/store/reviewer-notes.md)

发布时重点确认：

1. 不要写成“所有网站自动启用”
2. 不要写成“已上线正式付费订阅”
3. 要明确所有统计和报告只保存在本地

## 5. 后台提交流程

1. 打开 Chrome Web Store 开发者后台
2. 选择当前扩展条目
3. 上传 [eye-care-reminder-2.0.0-store.zip](/Users/liuwei/workspace/eye-care-extension/release/eye-care-reminder-2.0.0-store.zip)
4. 更新中文默认店铺名、短描述、长描述
5. 更新英文本地化的店铺名、短描述、长描述
6. 上传中文 4 张截图
7. 上传英文 4 张截图
8. 填写权限用途、隐私披露、数据使用表单
9. 粘贴这次版本的更新说明
10. 提交审核

## 6. 提交前最后自查

1. 上传包是否是 `store.zip` 而不是 `chrome.zip`
2. 商店名是否已经从 `微信读书护眼 / WeRead Eye Care` 改成更泛化的名称
3. `02-options` 截图里是否已经能看到“数据管理”
4. 更新说明里是否把 `专业版预览` 误写成正式订阅
5. 隐私说明里是否明确“本地优先、最小权限、只做提醒”
