# r73 CSS 徽章隐藏批次 Astra 审计

日期：2026-11-15（Asia/Shanghai）
runId：`r73-ai-expert-branding-css-badge-20261115-001`
reviewId：`ai-expert-branding-css-badge-20261115-r73`
结论：`approved-with-changes`

## 已通过的边界

- 当前 rc.5 Conversation 文件 SHA-256：`F7C22CFD56B2FFFB29FF9BC1B2D20B1B798FDF9D1C58FC39B3316BB01808DFC5`。
- Hero 根 class：`pXSMma_root`；徽章 class：`pXSMma_previewBadge`；标题组 class：`pXSMma_titleGroup`。
- `conversation.hero.brand.mark` 为 `scope=root`、`kind=single` 的公开 Slot。
- `visibility:hidden`、`opacity:0`、`pointer-events:none`、`user-select:none` 可以保留布局盒、保留 DOM 节点并阻止鼠标交互。
- `ShellAppearance` 的 `shell.overlay` React `<style>` 注入点可以作为自有 presentation CSS 的生命周期入口。

## Terra 首写前必须补齐

1. 增加精确静态 guard：校验官方包路径、版本、SHA-256、root/badge 成对锚点次数和 bytes；任何漂移 fail closed。
2. 增加 computed-style/UI 验收：节点存在、四个 CSS 属性正确、不可聚焦/交互、Hero/标题组 bounding box 与基线一致；覆盖主题、窄屏、离开再回、刷新、重启和 style 卸载。
3. 补充 Hero Slot 的 owner、props、children contract、priority 来源和包哈希；补充 `hero.headline` 官方 locale/预编译文件的原始字节、目标 UTF-8 字节、唯一锚点和回滚哈希。
4. 补充当前 rc.5 `dsh-client-ui-layout` 的 `productTitle` 精确补丁登记；Desktop 壳标题不能代替 `document.title`。
5. 将品牌 SVG 复制/导入 bundle，固定许可证和资源哈希；登记 SVG→RGBA16+sRGB ICC 转换脚本、Node/sharp/profile 版本和输出哈希。
6. 将 guard、测试、资源复制、转换脚本和两个官方显示补丁逐文件加入 allowlist；禁止泛化路径。

审计未修改源码或生成物。修订完成后可进入 Terra，但必须先生成新的 pre-snapshot。
