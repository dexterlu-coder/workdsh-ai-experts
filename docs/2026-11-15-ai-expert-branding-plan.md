# “AI专家办事大厅”品牌替换批次

日期：2026-11-15（Asia/Shanghai）
runId：`r71-ai-expert-branding-20261115-001`
状态：`blocked / astra-rejected`

## 目标

将本次三个客户可见区域统一为“AI专家办事大厅”，并使用已登记的学院门廊图标资源：

1. Windows 原生窗口标题与窗口图标；
2. 官方侧栏品牌文字与图标；
3. Conversation 首屏 Hero 文字与图标。

本批次不改变 Conversation 布局、Composer、右侧面板、模型调用、会话存储、专家执行逻辑或 DSH 版本。

## 已确认输入

- 当前源代码提交：`37b428eccbf9e626bac653d2996d22b3595c88b2`。
- 当前资源已复制到 `docs/assets/academy-ai-hall/icon-proposal-v1/`，17 个文件与来源逐个 SHA-256 一致。
- 图标来源为 Heroicons `building-library`，MIT 许可证；来源提交、清单和许可证见资源目录。
- 资源状态仍为 `proposal-not-installed`，本批次只把它纳入受控输入，尚未写入产品构建目录。
- 输入哈希、工作区 dirty 状态、allowlist 和禁止路径见 `.runs/r71-ai-expert-branding-20261115-001/input-snapshot.json`。

## 源码边界

- 侧栏品牌：`packages/bundle/src/client/components/Brand.tsx` 与 `packages/bundle/src/client/harness/client.ts` 的 `sidebar.brand.name`、`sidebar.brand.mark`。
- Hero 图标：固定 DSH rc.5 的公开 `conversation.hero.brand.mark` Slot；当前 WorkDSH 源码尚未注册该 Slot，需要先由 Astra 确认公开接口和兼容性。
- Hero 标题：官方 `dsh-client-ui-conversation` 预编译 locale 的 `hero.headline`，不是当前 WorkDSH 源码字段。若没有公开 locale 覆盖接口，只能作为固定版本、精确字节锚点和可回滚的品牌字段补丁单独登记。
- Desktop 标题/图标：`apps/desktop/src/workdsh-main.ts`、`apps/desktop/package.json` 及现有图标生成链。禁止直接手改派生 ICO、macOS PNG 或托盘 PNG。

## 资源策略

- 侧栏和 Hero 使用透明背景的 `mark-blue.svg`，尺寸由组件控制。
- 原生窗口使用 `academy-hall.svg` 派生的规范应用图标。
- 当前 `academy-hall-1024.png` 是 8 位 sRGB；现有 Desktop 生成器要求 RGBA16、ICC 配置，因此实施时必须增加可重复的转换步骤或受控源生成步骤，再运行现有 Windows/macOS/托盘派生脚本。
- 资源 README、manifest、许可证和来源快照保留，不把提案文档当作已验收产品资源。

## 标准流程

1. Astra/high 只读审计本计划、输入快照、当前源码和资源许可；审计只判断范围、接口、风险、验收和回滚，不写产品源码。
2. 主代理根据审计意见修订本计划，并登记新的输入哈希；冻结边界不变时不重复做全面审计。
3. Terra/high 首写前新建 pre-snapshot，确认当前 HEAD、dirty 文件归属、资源哈希、allowlist 和禁止路径。
4. Terra 只修改登记范围，完成品牌组件、公开 Slot 接入、Desktop 标题/资源生成链和必要的精确官方品牌字段补丁。
5. 自动检查构建、类型、静态引用、资源格式、派生图标哈希和回滚完整性。
6. Web 预览与 Desktop 打包运行时实际验收三个区域；任何未知官方字节、运行时残留、范围扩大或证据缺失都停止当前 Run 并分诊。

## 验收与回滚

- 三个区域显示完全相同的“AI专家办事大厅”。
- 三个区域使用学院门廊图标，蓝色透明标记与应用图标保持可证明的视觉来源关系。
- 页面布局、Composer、右侧面板、模型调用和专家入口行为与基线一致。
- Web 和 Desktop 都记录实际页面文字、图标资源、版本、哈希、命令、退出码和进程终态。
- 回滚采用逐文件反向补丁和恢复输入哈希；不使用 `git reset`、`git clean`，不删除历史证据。

## 当前门

审计已完成，结论为 `rejected`。详细回执见 [2026-11-15-ai-expert-branding-astra-audit.md](2026-11-15-ai-expert-branding-astra-audit.md)。必须先修订 Hero 接口证据、官方标题字节补丁、资源生成链、bundle 资源路径、Desktop 命名范围和输入快照，再使用新的 `runId`、`reviewId` 重新审计；当前不得进入 Terra 实施。
