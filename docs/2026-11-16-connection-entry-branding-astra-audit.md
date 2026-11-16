# r83 Desktop 入口页面品牌 Astra 审计

日期：2026-11-16（Asia/Shanghai）
批次：`r83-connection-entry-branding-20261116-001`
reviewId：`connection-entry-branding-20261116-r83`
审计性质：Astra/high 只读架构与范围审核
结论：`approved-with-changes`

## 审计范围

审计只读检查了当前 `DESIGN.md`、`PLAN.md`、项目规则、入口页面计划、`connection-entry.ts`、`workdsh-main.ts` 调用路径、学院图标资源和现有入口测试；没有修改文件、构建、启动或读取凭据/用户数据。

## 源码事实

- `connectionEntryHtml()` 生成选择使用方式页，当前输出 `<title>WorkDSH</title>` 和 `W WorkDSH`。
- `connectionLoadingHtml()` 复用基础 head/CSS，但再次输出相同 header；它覆盖个人、企业和依赖更新等待页。
- `enterpriseLoginHtml()` 也复制相同 header，并继承基础 CSP/head。
- `workdsh-main.ts` 已将 Electron 原生窗口标题固定为“AI专家办事大厅”；本批次无需修改它。
- `mark-blue.svg` 与现有 `LogoMark` 使用相同的 24x24 学院建筑图形和 `#2458A6`，可作为内联 SVG 的只读输入。

## 审计意见与修订

1. 允许范围收敛为 `apps/desktop/src/connection-entry.ts`、`apps/desktop/tests/connection-entry.spec.ts`、计划/设计/索引和本批次证据。
2. 通过纯静态 inline SVG header helper 统一入口、加载和企业登录页的品牌；将企业页的同步更新登记为有意的静态品牌传播，不改变企业协议、表单、权限或行为。
3. 保持 CSP、`workdsh:` 协议、转义逻辑、按钮/表单、加载动画、布局和原生窗口标题不变；不得修改官方 runtime、Electron、`workdsh-main.ts` 状态机或用户数据。
4. `apps/desktop/lib/`、派生图标和临时 UI run 只作为验证材料，不纳入源码 allowlist。
5. 测试必须覆盖三个生成页面的品牌、inline SVG、标题、安全转义、CSP、加载状态和企业表单；实际验收需要观察选择页和个人启动页，并记录进程、退出码和清理状态。

## 进入实施条件

本报告写入后，r83 计划状态为 `approved-with-changes / ready-for-terra`。首写仍须使用已登记的 runId、输入哈希和 pre-snapshot；发现范围、路径、协议、CSP、转义、布局或进程状态偏差时停止当前 run 并换新 runId。
