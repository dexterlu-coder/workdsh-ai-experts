# Desktop 入口页面品牌修改计划

日期：2026-11-16（Asia/Shanghai）
批次：`r83-connection-entry-branding-20261116-001`
reviewId：`connection-entry-branding-20261116-r83`
状态：`completed / current-source-ui-accepted`

Astra/high 只读审计结论：`approved-with-changes`，详见 [2026-11-16-connection-entry-branding-astra-audit.md](2026-11-16-connection-entry-branding-astra-audit.md)。审计指出的范围澄清已登记在本计划中。

## 目标

将 Desktop carrier 的两个本地入口页面统一显示为“AI专家办事大厅”及学院建筑图标：

1. “选择使用方式”页面；
2. “正在启动个人工作区”页面。

页面顶部的 Electron 原生窗口标题已经由现有 r81 品牌改动处理，本批次只补齐页面内部的文档标题、品牌标题和品牌图标。

## 源码事实

- `apps/desktop/src/connection-entry.ts` 的 `connectionEntryHtml()` 生成选择使用方式页面，当前仍包含 `<title>WorkDSH</title>` 和 `W WorkDSH`。
- 同文件的 `connectionLoadingHtml()` 生成个人/企业启动等待页面，复用入口基础样式，但再次硬编码 `W WorkDSH`。
- `enterpriseLoginHtml()` 也复制了同一顶部品牌；本批次有意通过共享 helper 同步静态品牌到企业登录页和企业启动等待页，作为同一 carrier header 的一致性修复，不改变企业登录行为、协议或权限。
- `apps/desktop/src/workdsh-main.ts` 在入口选择、个人启动和企业启动路径加载这些 HTML；本批次不改导航、协议、Host、Profile 或状态机。
- `packages/ui/assets/mark-blue.svg` 与 `packages/ui/src/components/LogoMark.tsx` 是当前已验收的学院建筑图标来源。Desktop carrier 不直接依赖 React UI 包，入口页面使用安全的内联 SVG 表达同一图形。
- 现有 `apps/desktop/tests/connection-entry.spec.ts` 已覆盖 XSS 转义、CSP、加载状态和企业插件按钮条件，将补充品牌字段断言。

## 允许与禁止

允许修改：

- `apps/desktop/src/connection-entry.ts`；
- `apps/desktop/tests/connection-entry.spec.ts`；
- 本计划、DESIGN/PLAN、`docs/RESEARCH_INDEX.md` 和本批次证据。

构建产生的 `apps/desktop/lib/`、`apps/desktop/build/app-icon*` 和临时 UI run 目录只作为派生验证材料；它们不属于本批次源码 allowlist，也不改变官方 runtime/Profile/Electron。

禁止修改：

- 官方 DSH 源码、官方 runtime 字节和 Electron 二进制；
- `workdsh-main.ts` 的入口切换、Host、Agent、模型、协议和会话存储逻辑；
- 页面按钮、表单、CSP、转义、加载动画、布局尺寸和企业登录行为；
- 用户数据、凭据、Token、Cookie 和运行时副本。

## 实施与验收

1. Astra/high 只读审核本计划、当前源码、现有品牌资源和测试已完成，结论为 `approved-with-changes`。
2. 生成新的 `runId`、输入哈希和 pre-snapshot；首写只落在允许路径。
3. 集中定义入口品牌 header，替换两个目标页面的文档标题、标题文字和内联学院图标；共享 enterprise login/header 以避免相同代码再次漂移，并记录这是有意的静态品牌传播。
4. 运行 Desktop 类型检查和 `connection-entry.spec.ts`；检查 HTML 中不再出现目标页面的 `WorkDSH`/`W` 品牌，且原有安全断言仍通过。
5. 使用干净个人运行目录实际观察选择使用方式页和个人启动页，保存截图、窗口标题、进程/退出码和输入/输出哈希。

成功标准：两个页面都显示“AI专家办事大厅”和学院建筑图标，个人按钮和启动流程仍可用，安全与布局测试通过。

实施回执：[2026-11-16-connection-entry-branding-r84-ui-acceptance.md](2026-11-16-connection-entry-branding-r84-ui-acceptance.md)。r84 已通过选择页、个人启动页和随后主界面实际窗口验收；r83 的插值失败已按错误分诊换用新 runId。

## 回滚

只恢复 `connection-entry.ts`、对应测试和本批次文档/证据；不触碰 r81 已验收的主界面品牌、官方 runtime、用户数据和专家资产。
