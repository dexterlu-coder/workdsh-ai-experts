# “AI专家办事大厅”品牌替换与 Hero 徽章隐藏批次

日期：2026-11-15（Asia/Shanghai）
reviewId：`ai-expert-branding-css-badge-20261115-r72`
runId：`r72-ai-expert-branding-css-badge-20261115-001`
状态：`blocked / astra-rejected`

## 目标

按区域完成当前源代码的品牌替换：

1. 黄色框：原生窗口标题、动态页面标题和窗口图标使用“AI专家办事大厅”；
2. 蓝色框：侧栏名称和图标使用“AI专家办事大厅”品牌资源；
3. 红色框：Conversation Hero 图标和标题使用“AI专家办事大厅”，并**隐藏**官方“预览版”徽章，保留官方节点和其他 Conversation 行为。

历史黄色窗口标题和蓝色侧栏结果作为基线，历史红色 Hero 实现作为接口和补丁参考；历史结果不能直接作为当前版本验收。

## 用户已确认的范围

- 目标文字：`AI专家办事大厅`。
- 预览徽章：只隐藏，不删除官方组件节点。
- 当前计划先覆盖客户可见的窗口/页面/侧栏/Hero；安装器、快捷方式、appId、托盘和产品身份不在本批次自动扩大，除非后续单独登记。

## 已知历史输入

- 历史黄色窗口标题通过证据：`dependency-reproducibility-20261111-electron-r3`。
- 历史蓝色侧栏通过证据：`startup-ui-audit-20261112` 的 `visibleSidebarBrand`。
- 历史红色 Hero 代码和 rc.5 精确补丁规格：`workdsh-academy-branding-abr-20261107T012336Z` 的 `HeroMark`、`conversation.hero.brand.mark` 和 `academy-brand-patch.json`；历史真实 UI 仍显示鱼标和原始 Hero 标题。
- 上一批 `r71-ai-expert-branding-20261115-001` 已被 Astra `rejected`，不能续用；详细原因见 [旧审计](2026-11-15-ai-expert-branding-astra-audit.md)。

## 候选实现路径

- 自有品牌：`packages/bundle/src/client/components/Brand.tsx`、`packages/bundle/src/client/harness/client.ts`、`packages/ui/src/components/LogoMark.tsx`。
- Hero 图标：先验证固定 rc.5 的公开 `conversation.hero.brand.mark` Slot、owner、props 和 fallback；确认后由自有 `HeroMark` 注册，不复制官方 Hero。
- Hero 标题：先定位固定 rc.5 的 `hero.headline` locale/预编译字节；只有原始 SHA、唯一锚点和回滚哈希完全匹配时才允许精确补丁。
- Hero 徽章隐藏：优先使用现有自有 `ShellAppearance` presentation-only CSS 注入点（`packages/bundle/src/client/components/ShellAppearance.tsx`），以固定 rc.5 的稳定 class suffix 或经审计的选择器隐藏 `previewBadge`；不修改官方 JSX、不删除节点、不用 MutationObserver。
- Desktop 标题/图标：`apps/desktop/src/workdsh-main.ts` 和历史确定性 SVG→RGBA16+ICC 生成链；不直接编辑派生 ICO/PNG。

## allowlist / denylist

允许路径候选：

- `packages/bundle/src/client/components/Brand.tsx`
- `packages/bundle/src/client/components/ShellAppearance.tsx`
- `packages/bundle/src/client/harness/client.ts`
- `packages/ui/src/components/LogoMark.tsx`
- `apps/desktop/src/workdsh-main.ts`
- 品牌规范 SVG、bundle 内资源复制步骤和图标生成脚本
- 固定 rc.5 官方显示文件的精确品牌字段补丁（需单独列出文件、版本、哈希、锚点）

禁止路径：

- 官方 DSH 源码仓库、用户数据、凭据、Token、Cookie、用户正文
- Conversation 布局、Composer、消息视图、右侧面板、模型/Agent/Host、会话存储
- 安装器、快捷方式、appId、托盘和产品身份字段（本批次未登记）
- 直接手改 `apps/desktop/build` 派生图标
- 删除官方 Hero 徽章节点、复制或重写官方 Conversation 控件

## 标准流程

1. Astra/high 只读审计本计划、历史证据、当前源码、固定 rc.5 Slot/locale 和 CSS 选择器。
2. 若结论为 `approved` 或 `approved-with-changes`，主代理保存审计意见并确认冻结边界；若 `rejected`，保持 blocked。
3. Terra/high 首写前生成新的 pre-snapshot，确认当前 HEAD、dirty ownership、allowlist/denylist、资源和官方包哈希。
4. Terra 只实现登记范围；任何未知字节、selector drift、资源未进入 bundle 或范围扩大立即停止并换新 run。
5. 运行构建、类型、静态、资源和回滚检查。
6. Web preview 与 Desktop packaged-runtime clean profile 实际验收黄色、蓝色、红色三个区域，另验证徽章隐藏和布局不变。

## 验收与回滚

- 黄色：BrowserWindow title、页面 `document.title` 首次加载/会话切换/刷新后均为“AI专家办事大厅”，窗口图标来自规范源。
- 蓝色：侧栏文字和图标在展开/收起、浅色/深色主题下正确。
- 红色：Hero 图标和标题正确，预览徽章不可见但官方节点仍在，Composer、Hero 布局和交互不变。
- 旧官方包版本、非品牌行为和专家入口不回归。
- 回滚逐文件恢复自有源码、CSS 选择器、资源和官方补丁的原始哈希；保留全部证据，不使用 `git reset` 或 `git clean`。

审计已完成，结论为 `rejected`。详细回执见 [2026-11-15-ai-expert-branding-css-astra-audit.md](2026-11-15-ai-expert-branding-css-astra-audit.md)。必须补充真实 rc.5 DOM/selector 证据、保持布局的隐藏策略、Hero Slot/locale 证据和 pre-snapshot 后，使用新的 `runId`、`reviewId` 重新审计；当前未修改产品源码。
