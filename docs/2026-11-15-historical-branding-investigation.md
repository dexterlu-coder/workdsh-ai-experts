# 历史品牌替换结果调查

日期：2026-11-15（Asia/Shanghai）
范围：只读调查 `workdsh-academy-branding-abr-20261107T012336Z`、`workdsh-ai-expert-candidate`、历史品牌 Run 与启动 UI 回执。
结论类型：源码事实、历史补丁事实、真实 UI 实验结果分开记录。

## 结论

历史上分别做过三个区域的替换：黄色框的原生窗口标题曾经通过 Electron 壳验收，蓝色框的侧栏品牌曾经在实际页面读到目标文字，红色框只有源码/补丁实现记录，实际 Hero 仍未通过。

没有证据证明三个区域同时验收成功，但这不是本次调查的判断标准；下面按三个区域分别记录。

## 三个区域分别的历史结果

### 黄色框：原生窗口标题与窗口图标

- 源码实现：历史候选的 `workdsh-main.ts` 使用统一品牌常量设置 `BrowserWindow.title`、`page-title-updated` 和 `app.setName`，窗口图标继续由 `app-icon.png` 提供。
- 实际结果：`dependency-reproducibility-20261111-electron-r3` 回执记录真实 Electron 窗口标题为 **“AI专家办事大厅”**，状态为 `electron-candidate-verified`。
- 限制：该回执验证的是 Electron 壳、窗口、进程和退出；该 run 的 runtime 缺少 `primary-runtime`，因此不能把它扩展成完整 DSH 工作区验收。
- 动态网页标题：另一份 `startup-ui-audit-20261112` 读到 `documentTitle: DeepSeek Harness`，说明黄色框对应的“原生窗口标题”曾成功，但页面动态标题仍失败。

### 蓝色框：左侧栏品牌

- 源码实现：历史候选 `Brand.tsx` 提供 `BrandName`/`BrandMark`，`client.ts` 注册 `sidebar.brand.name` 和 `sidebar.brand.mark`。
- 实际结果：`startup-ui-audit-20261112` 读到 `visibleSidebarBrand: AI专家办事大厅`，并记录 `sidebarSvgAria: AI专家办事大厅`。
- 结论：蓝色框有实际运行证据，历史上确实替换成功。

### 红色框：Conversation Hero

- 源码实现：历史候选增加了 `HeroMark`，并注册 `conversation.hero.brand.mark`；官方 rc.5 Conversation 包确实声明并渲染该 Slot。
- 官方补丁：`academy-brand-patch.json` 登记了 `dsh-client-ui-conversation/lib/client.js` 的 HeroFish 精确替换，以及 `hero.headline` 所属官方资源的补丁范围。
- 实际结果：`startup-ui-audit-20261112` 仍读到官方鱼形 SVG（`pXSMma_fish`）和 `探索未至之境`，该区域实际验收失败。
- 结论：红色框有源码和补丁实现，但没有历史真实 UI 通过证据；不能称为已经成功替换。

## 历史源码实现

在 `workdsh-academy-branding-abr-20261107T012336Z` 中发现：

- `packages/bundle/src/client/components/Brand.tsx` 提供 `BrandName`、`BrandMark` 和 `HeroMark`。
- `packages/bundle/src/client/harness/client.ts` 同时注册 `sidebar.brand.name`、`sidebar.brand.mark` 和 `conversation.hero.brand.mark`。
- `apps/desktop/src/workdsh-main.ts` 使用统一品牌常量设置 BrowserWindow title、`page-title-updated` 和 `app.setName`。
- `apps/desktop/src/connection-entry.ts` 使用统一品牌常量生成连接、登录和加载页。
- `packages/ui/assets/academy-brand.json` 保存名称、短名称、appId、数据目录、颜色和 SVG SHA-256。
- `apps/desktop/scripts/academy-brand-assets.mjs` 以 SVG 为唯一源，使用 Sharp 生成 RGBA16、sRGB ICC 的 `app-icon.png`，再运行现有 ICO、macOS 和托盘生成链。

这些实现说明了当前批次应采用的架构：品牌常量、bundle 内资源、公开 Slot、Desktop 标题链和确定性图标生成器必须一起闭合。

## 官方 rc.5 精确补丁事实

历史文件 [academy-brand-patch.json](D:/project/codex/workdsh-academy-branding-abr-20261107T012336Z/scripts/academy-brand-patch.json) 登记了 `0.2.1-rc.5` 的显示补丁，包含：

- `@deepseek-ai/dsh-client-ui-layout/lib/client.js` 的 `productTitle`；
- `@deepseek-ai/dsh-client-ui-sidebar/lib/client.js` 的侧栏回退名称和图标；
- `@deepseek-ai/dsh-client-ui-conversation/lib/client.js` 的 HeroFish 回退图标；
- 官方 Web HTML、manifest、浅色/深色 favicon；
- 官方品牌插件的品牌回退。

每个条目都记录了版本、原始 SHA-256、目标 SHA-256、唯一替换锚点和回滚哈希。后续 `terra-brand-unification-20261112` 还留下了一个 `productTitle` 精确补丁回执，但没有完成三个区域的最终 GUI 验收。

## 真实 UI 证据

历史回执：[startup-ui-audit-20261112/ui-audit-result-20261112.json](D:/project/codex/DeepSeek%20harness%20usage-runs/startup-ui-audit-20261112/ui-audit-result-20261112.json)。关键观察：

```text
visibleSidebarBrand = AI专家办事大厅
documentTitle       = DeepSeek Harness
hero SVG            = 官方 fish
hero headline       = 探索未至之境
```

该回执明确将窗口/标题和主界面 Hero 标为失败，侧栏标为已观察到目标文字。它还记录了新会话和专家页面的其他运行问题，因此不能把该次运行称为完整品牌验收。

## 对当前批次的影响

1. Astra 之前指出的 Hero 接口和官方字节补丁问题，现在有历史证据可以作为新的审计输入，但必须重新核对当前固定 rc.5 资源哈希，不能直接复用旧 Run。
2. 当前 `academy-hall-1024.png` 的格式问题已有历史解决方案：从 SVG 用 Sharp 生成 RGBA16+ICC PNG；应复用方法，不直接喂 8 位 PNG。
3. 历史目标文字曾经是“培训学院 AI 大厅”或“AI专家办事大厅”两套名称；当前产品目标已经锁定为“AI专家办事大厅”，所以历史补丁只能作为结构和验证方法参考。
4. 当前批次仍保持 `blocked`。需要以这些历史证据修订计划，创建新的 `runId`、`reviewId` 和输入快照，再重新进行 Astra 审计。

## 证据边界

- 历史候选的源码和补丁规格证明“曾经实现过这些路径”。
- `startup-ui-audit-20261112` 证明一次真实运行中侧栏成功、动态标题和 Hero 失败。
- 没有找到同时证明红、黄、蓝三个区域都已通过的真实 Desktop packaged-runtime 验收回执。
- 本调查没有修改当前项目源码、官方运行时或历史目录。
