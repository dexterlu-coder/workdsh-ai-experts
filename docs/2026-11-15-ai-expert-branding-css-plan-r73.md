# “AI专家办事大厅”品牌替换与 Hero 徽章隐藏 r73 计划

日期：2026-11-15（Asia/Shanghai）
reviewId：`ai-expert-branding-css-badge-20261115-r73`
runId：`r73-ai-expert-branding-css-badge-20261115-001`
状态：`blocked / terra-official-runtime-write-rejected`

## 本轮修订

上一批 r72 因选择器和布局证据不足被拒绝。本轮已从当前固定 DSH `0.2.1-rc.5` 文件取得精确输入：

- 文件：`@deepseek-ai/dsh-client-ui-conversation/lib/client.js`
- 当前 SHA-256：`F7C22CFD56B2FFFB29FF9BC1B2D20B1B798FDF9D1C58FC39B3316BB01808DFC5`
- Hero 根 class：`pXSMma_root`
- Hero 标题容器：`pXSMma_headline` / `pXSMma_titleGroup`
- 预览徽章 class：`pXSMma_previewBadge`
- Hero 插槽：`conversation.hero.brand.mark`，scope `root`、kind `single`
- 当前文案：`hero.headline = 探索未至之境`，`hero.preview = 预览版`

## 目标

- 黄色框：原生窗口标题、动态页面标题和窗口图标为“AI专家办事大厅”；
- 蓝色框：侧栏名称和图标为“AI专家办事大厅”；
- 红色框：Hero 图标和标题为“AI专家办事大厅”；
- 红色框的“预览版”徽章只隐藏，不删除 DOM 节点，不改变标题组布局。

## CSS 隐藏策略

只允许在自有 `ShellAppearance` presentation CSS 中加入固定 rc.5 的严格作用域规则：

```css
[class~="pXSMma_root"] [class~="pXSMma_previewBadge"] {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  user-select: none;
}
```

实施前必须通过静态 guard 确认当前官方文件同时包含 `pXSMma_root` 和 `pXSMma_previewBadge`；任一锚点缺失、出现重复版本或 package SHA 漂移立即停止。禁止 `display:none`、通用 `.badge`、文本选择器、全局 `!important`、MutationObserver、JS 删除节点和修改官方 JSX。

## 实施范围

允许路径：

- `packages/bundle/src/client/components/Brand.tsx`
- `packages/bundle/src/client/components/ShellAppearance.tsx`
- `packages/bundle/src/client/harness/client.ts`
- `packages/ui/src/components/LogoMark.tsx`
- `apps/desktop/src/workdsh-main.ts`
- 品牌规范 SVG、bundle 内资源复制步骤和图标生成脚本
- 固定 rc.5 的精确 Hero headline/brand fallback 显示补丁（仅在当前 hash 和唯一锚点匹配时）
- 固定 rc.5 `dsh-client-ui-layout` 的 `productTitle` 精确补丁（仅在当前 hash 和唯一锚点匹配时）
- 品牌 guard、computed-style 测试、bundle 资源复制和 SVG→RGBA16+sRGB ICC 转换脚本

禁止路径：

- 官方 DSH 源码 checkout、用户数据和凭据；
- Conversation 布局、Composer、消息视图、右侧面板、模型/Agent/Host、会话存储；
- 安装器、快捷方式、appId、托盘和产品身份；
- 手改派生 ICO/PNG；
- 删除预览徽章节点或复制官方 Conversation 控件。

## 验收

- Web preview 与 Desktop packaged-runtime clean profile 读取 BrowserWindow title、`document.title`、侧栏文字/aria、Hero 文字/图标。
- `pXSMma_previewBadge` 节点仍存在，计算样式为不可见且不可交互；标题组和 Hero bounding box 保持基线尺寸。
- 浅色/深色、窄屏、离开再回、刷新、重启和已初始化 Profile 均验证。
- 官方 rc.5 其他字节、模型、Host、Agent、Composer、消息视图和会话存储不变。

审计结论为 `approved-with-changes`，但 Terra 首写阶段对官方运行时文件的精确补丁被自动审查拒绝。分诊回执见 [r73 failure-triage.md](../.runs/r73-ai-expert-branding-css-badge-20261115-001/failure-triage.md)。当前 Run 已停止，保留自有源码改动，未修改官方运行时、未构建、未验收；后续必须新建 Run 重新登记官方显示适配交付方式。
