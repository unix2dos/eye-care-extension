# Release Prep Checklist

这份清单用于把当前工作区里的 `Eye Care Reminder` 发布为下一次 Chrome Web Store 更新。

## 1. 先定版本号

当前工作区版本号已经设置为 `2.0.1`：

- [package.json](/Users/liuwei/workspace/eye-care-extension/package.json)
- [public/manifest.json](/Users/liuwei/workspace/eye-care-extension/public/manifest.json)

如果发布前还要继续改代码，记得在最终构建前确认这两个文件仍然保持一致。

为什么是 `2.0.1`：

- 从“微信读书专用提醒”演进成了“微信读书阅读页默认支持 + 普通网页按站点启用”
- 新增了 `20-20-20`、休息引导、健康报告、PDF 导出、数据管理、免费版/专业版能力边界
- 商店文案、权限说明和用户心智都已经是一次明显升级

## 2. 发版前必须通过的检查

在项目根目录执行：

```bash
npm test -- --run
npx tsc --noEmit
npm run build
git diff --check
```

通过标准：

- 全部测试通过
- TypeScript 无报错
- 构建成功
- diff 无空白/格式错误

## 3. 必做手工 QA

按 [docs/manual-qa-checklist.md](/Users/liuwei/workspace/eye-care-extension/docs/manual-qa-checklist.md) 执行，但发布前重点只看这些高风险项：

1. 普通网页授权启用
2. 已启用站点移除
3. `20-20-20` 的 `20 秒` 倒计时
4. `prefers-reduced-motion` 退化
5. 免费版 / 专业版预览切换
6. `导出报告 PDF`
7. `导出原始数据 CSV`
8. `清空本地数据` 的确认框
9. popup / options 的健康说明布局

## 4. 发版时不要说错的话

当前真实产品边界：

- 微信读书阅读页默认支持
- 其他网页需要按站点授权
- 真实支付还没接入
- `专业版预览` 只是本地 feature preview，不是正式订阅
- 所有统计、报告和预览状态都只保存在本地

所以商店文案和发布说明里不要写：

- “已支持正式付费订阅”
- “专业版现已开售”
- “支持云同步”
- “支持所有网站自动启用”

## 5. 要更新的商店素材

发布前至少更新这几项：

1. [docs/store/chrome-web-store-assets.md](/Users/liuwei/workspace/eye-care-extension/docs/store/chrome-web-store-assets.md)
2. [docs/store/chrome-web-store-form-answers.md](/Users/liuwei/workspace/eye-care-extension/docs/store/chrome-web-store-form-answers.md)
3. [PRIVACY.md](/Users/liuwei/workspace/eye-care-extension/PRIVACY.md)
4. `docs/store/images/zh/*.png`
5. `docs/store/images/en/*.png`

建议重拍的截图重点：

1. popup：展示“微信读书阅读页默认支持 / 普通网页按需启用”的状态
2. options：展示新的首屏层级
   - 提醒设置
   - 用眼健康报告
   - 数据管理
   - 运行诊断 / 版本预览折叠
3. reminder：展示 `20-20-20` 倒计时和引导
4. toolbar：展示 `读 / 停`

## 6. 推荐的商店更新说明来源

可直接参考：

- [docs/release-notes-next.md](/Users/liuwei/workspace/eye-care-extension/docs/release-notes-next.md)
- [docs/store/chrome-web-store-assets.md](/Users/liuwei/workspace/eye-care-extension/docs/store/chrome-web-store-assets.md)

## 7. 版本号位置

发布前最后确认：

1. [package.json](/Users/liuwei/workspace/eye-care-extension/package.json)
2. [public/manifest.json](/Users/liuwei/workspace/eye-care-extension/public/manifest.json)

## 8. 打包与上传

建议流程：

1. 如果代码还有变化，先重新执行：

```bash
npm test -- --run
npx tsc --noEmit
npm run build
```

2. 打开 `dist/` 确认输出完整
3. 优先使用当前已经准备好的上传包：
   - [release/eye-care-reminder-2.0.1-store.zip](/Users/liuwei/workspace/eye-care-extension/release/eye-care-reminder-2.0.1-store.zip)
   - 说明：不包含 `*.map`，更适合商店上传
   - SHA-256：`39a4815a0e01f2d42b540af4e4b3bebb84e7e7e682f4373b6fed05efc81f4df5`
4. 当前没有 `2.0.1` sourcemap 归档包；旧包仅用于历史回溯，不用于本次发布：
   - [release/eye-care-reminder-2.0.0-chrome.zip](/Users/liuwei/workspace/eye-care-extension/release/eye-care-reminder-2.0.0-chrome.zip)
   - SHA-256：`917bf97d8a21ddd992afd7a43f5224e5253dc470c6ba8f6687b73ba22390205d`
5. 在 Chrome Web Store 后台更新：
   - zip 包
   - store 文案
   - 隐私披露
   - 版本更新说明
   - 截图

## 9. 发布后快速回归

商店更新提交后，至少再确认一次：

1. 新安装用户默认是免费版
2. 微信读书页面无需额外授权即可工作
3. 普通网页仍然走按站点授权
4. popup 和 options 中的健康说明可见
5. PDF / CSV / 重置确认这三条主流程正常

## 10. 当前最可能遗漏的点

发布前最后再看一次：

1. 商店截图里是否还保留旧的“微信读书专用”文案
2. 说明文案里是否把 `专业版预览` 误写成正式付费能力
3. 是否已经把 `导出原始数据 CSV` 与 `导出报告 PDF` 区分开
4. 是否仍有旧截图把 `当前状态` 大块面板放在首屏
