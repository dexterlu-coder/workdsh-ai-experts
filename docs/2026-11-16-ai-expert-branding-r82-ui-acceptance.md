# AI 专家办事大厅品牌界面验收（r82）

日期：2026-11-16（Asia/Shanghai）
材料性质：实验结果、源码事实、稳定验收证据
关联批次：r81 当前源码品牌 UI 验证计划

## 目标与范围

本批次从当前源码生成自有 UI/Bundle 产物，在已验证的 Electron 和 WorkDSH runtime 上进行个人模式实际窗口验收。目标是：

- 原生窗口标题和图标显示“AI专家办事大厅”；
- 左上方侧栏品牌图标和标题显示“AI专家办事大厅”；
- Conversation Hero 图标和标题显示“AI专家办事大厅”；
- Hero 的“预览版”徽章通过 CSS 隐藏；
- 保持原有布局、交互、Composer、右侧面板、Host、Agent、模型调用、会话存储，以及左上方“新会话”按钮的位置。

本批次没有修改官方 DSH 源码或官方 runtime 字节，也没有进行正式安装包发布。

## 源码与运行事实

- 源码提交：`37b428eccbf9e626bac653d2996d22b3595c88b2`。
- 自有品牌来源：`packages/ui/src/academy-brand.ts`、`packages/ui/assets/mark-blue.svg` 和学院应用图标资源。
- 自有实现：`packages/ui/src/components/LogoMark.tsx`、`packages/bundle/src/client/components/Brand.tsx`、`packages/bundle/src/client/harness/client.ts`、`packages/bundle/src/client/components/ShellAppearance.tsx`、`apps/desktop/src/workdsh-main.ts`。
- Electron 可执行文件 SHA-256：`31A0176B7C1A81CF379E55E109C57A56493A4D4A9E9B0D2475A678FD7DF234DC`。
- 当前运行时自有 Bundle `client.js` SHA-256：`86DF93E0400F4D1329E5E6114B4E9EB1C27789DF949750620934D6D863349192`。
- 当前运行时自有 Bundle harness `client.js` SHA-256：`251D55CB9060A7CDF67B71A7BF81BAE38882426A8AA20C76DE65B0D67A141832`。
- 当前运行时自有 UI `index.js` SHA-256：`37B6930BD36F988570C039AAAE2783C017F18E15E1615B771BD44184F639A0E5`。
- 运行根目录：`D:\project\codex\workdsh\r82-current-source-personal-20261116-001`。
- 运行方式：复用已校验 Electron 与稳定 runtime，只隔离个人 user-data、DSH_HOME、临时目录、日志、端口和进程；没有复制整套 runtime。

## 实际窗口验收

2026-11-16 在 r82 个人模式窗口中观察到：

1. 窗口左上角原生标题为“AI专家办事大厅”，应用图标为蓝色学院建筑图标。
2. 左侧栏顶部品牌图标和标题为“AI专家办事大厅”。
3. 主界面 Conversation Hero 显示蓝色学院建筑图标和“AI专家办事大厅”。
4. Hero 区域没有显示“预览版”徽章。
5. 左上方侧栏的“新会话”按钮仍处于原位置；Composer、工作区入口和导航布局保持可用。

截图由当前窗口实际捕获；这是本批次的视觉验收证据。辅助可访问性树仍可能报告官方原始 `document.title`/Hero 文本，因为本批次没有修改官方 runtime 的语义文本；视觉层的品牌显示以实际窗口截图为准。

## 结论与回滚

本批次的视觉目标已完成，状态为 `completed / current-source-ui-accepted`。回滚时只恢复本批次自有源码、品牌资源和生成产物；保留官方 runtime、历史运行证据和专家资产。
