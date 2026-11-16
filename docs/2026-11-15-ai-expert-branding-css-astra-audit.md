# “AI专家办事大厅” CSS 徽章隐藏批次 Astra 审计

日期：2026-11-15（Asia/Shanghai）
批次：`r72-ai-expert-branding-css-badge-20261115-001`
reviewId：`ai-expert-branding-css-badge-20261115-r72`
结论：`rejected / blocked`

## 结论

CSS 隐藏方案可以作为候选方向，但当前计划不能进入 Terra。原因是选择器、DOM owner、布局影响和固定 rc.5 Hero 接口还没有通过 fail-closed 验证。

## 必须修订

1. 从当前固定 rc.5 Conversation 包取得实际 DOM 证据：Conversation root、Hero owner、preview badge 的稳定 `data-*` 或 class 属性、祖先关系、包/file SHA-256。计划中的 `previewBadge` 只是历史源码名，不能直接当作当前运行时选择器。
2. CSS 必须作用于唯一 Conversation Hero 容器，禁止通用 `.badge`、文本选择器、全局选择器和未经证明的 class suffix；不得影响专家、侧栏、设置页或其他插件徽章。
3. `display:none` 会移除布局占位，不能直接使用。应根据真实 DOM 选择 `visibility:hidden` 或 `opacity:0; pointer-events:none` 等保留布局的 presentation-only 规则，并验证节点仍存在、不可聚焦、不可点击、无溢出。
4. `ShellAppearance` 当前只注入全局 style，需证明生命周期、卸载和页面隔离；其“Never changes hit areas”注释要与隐藏策略保持一致。选择器、声明和作用域哈希必须进入静态测试与回滚清单。
5. Hero 图标和 Hero 标题必须分别补证：当前 rc.5 的 `conversation.hero.brand.mark` owner/props/priority/children，以及 `hero.headline` locale 文件、原始 SHA、唯一锚点、目标 UTF-8 字节和 fail-closed guard。历史补丁不能直接复用。
6. 黄色窗口标题、动态 `document.title`、蓝色侧栏和红色 Hero 必须分别验收；历史窗口壳和侧栏结果不能替代当前版本验证。
7. Terra 前重新生成 pre-snapshot，记录当前 dirty ownership；资源必须进入 bundle 闭包，派生图标只能由脚本生成。

## 验收要求

- Web preview 与 Desktop packaged-runtime clean profile 读取 BrowserWindow title、`document.title`、侧栏 name/aria、Hero title/icon。
- 徽章 DOM 节点仍存在，但不可见、不可聚焦、不可点击；Hero 布局 bounding box、Composer、右侧面板和消息视图保持不变。
- 浅色/深色、窄屏、导航离开再回、重启和已初始化 Profile 均验证。
- 官方 rc.5 包哈希、模型、Host、Agent 和 session 行为保持不变。

## 当前状态

本批次保持 `blocked`。必须修订计划并使用新的 `runId`、`reviewId` 和输入快照重新审计；当前不得进入 Terra 首写。
