# “AI专家办事大厅”品牌替换批次 Astra 审计

日期：2026-11-15（Asia/Shanghai）
批次：`r71-ai-expert-branding-20261115-001`
审计：Astra/high 只读审计
结论：`rejected / blocked`

## 审计输入

- 计划：[2026-11-15-ai-expert-branding-plan.md](2026-11-15-ai-expert-branding-plan.md)
- 输入快照：[.runs/r71-ai-expert-branding-20261115-001/input-snapshot.json](../.runs/r71-ai-expert-branding-20261115-001/input-snapshot.json)
- 源码提交：`37b428eccbf9e626bac653d2996d22b3595c88b2`
- 目标文字：`AI专家办事大厅`

## 结论

当前批次不能进入 Terra 首写。侧栏品牌入口和 Desktop 标题入口可以继续作为候选范围，但 Conversation Hero 入口、官方标题替换、资源生成链和输入快照尚未满足 fail-closed 要求。

## 必须修订

1. 从精确 DSH `0.2.1-rc.5` runtime/tarball 捕获 `conversation.hero.brand.mark` 的公开类型、owner registration、props、优先级和 children contract。当前只能确认历史资料提到该字符串，不能把它当作当前版本已验证接口。
2. Hero 标题必须单独登记官方 `dsh-client-ui-conversation` 的精确 locale 文件、包版本、原始字节、文件 SHA-256、替换锚点、UTF-8 新字节和 fail-closed guard。缺少这些信息时保持 blocked。
3. 修正 allowlist：`apps/desktop/build/app-icon.png`、`tray-icon.svg` 和派生 PNG/ICO 只能作为生成结果验收，不能作为直接修改路径。
4. `academy-hall-1024.png` 是 1024×1024、8 位 RGBA、无 ICC 的 sRGB PNG；现有生成器要求 RGBA16、ICC。必须固定 SVG/PNG 到 RGBA16+ICC 的转换步骤、Node/sharp/profile 版本和 profile hash。
5. `mark-blue.svg` 不能从 `docs/` 运行时引用。必须登记 bundle 内的资源复制/导入步骤、许可证和包内产物验证。
6. 明确 Desktop 目标只修改窗口/页面标题，还是同时修改 `productName`、快捷方式、artifact name 和应用身份；后者会影响安装升级边界。
7. 当前输入快照已过时：快照之后新增了计划、审计和设计文档修改。下一批次必须新建 `runId` 和 pre-snapshot，逐项记录 dirty ownership。

## 风险与验收要求

- Hero Slot 不存在或 props 不符时可能静默 no-op，不能猜字符串注入。
- 直接修改派生图标会造成 generator/hash drift。
- Web preview 和 Desktop packaged-runtime 都必须在 clean profile 实际读取窗口标题、页面标题、侧栏文字/图标和 Hero 文字/图标。
- 必须确认布局、Composer、右侧面板、消息视图、Host、Agent、模型调用和会话存储没有变化。
- 回滚采用逐文件反向补丁并恢复官方 locale 原始字节、图标输入和派生哈希；保留所有证据，不使用 `git reset` 或 `git clean`。

## 状态

本批次保持 `blocked`。修订计划和范围后必须使用新的 `runId`、`reviewId` 和输入快照，再重新进行 Astra 只读审计；在此之前不得修改产品源码、官方运行时字节或派生图标。
