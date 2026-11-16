# AI专家办事大厅：固定 rc.5 staging 显示补丁计划（r74）

状态：`approved-with-changes-terra-ready`

Astra/high 只读审计：`r74-readonly-vendor-copy-fallback-v1`，结论 `approved-with-changes`。该审计已完成 staging 级验证；r74-009 证明 Electron Builder 会保留 staging 的绝对 Junction，打包闭包仍不自包含，分诊见 [.runs/r74-ai-expert-branding-staging-20261115-009/failure-triage-packaged-junction-escape.json](../.runs/r74-ai-expert-branding-staging-20261115-009/failure-triage-packaged-junction-escape.json)。新增包前 materialization 层需复审。

本计划承接 r73 的范围，但更换实施边界：官方 DSH rc.5 的共享构建运行时保持不可变；只在一个每次新建的 staging 目录中复制并应用精确的显示替换。r73 的直接写入被自动审查拒绝，不能原地重试。

## 目标

1. 让当前固定 `0.2.1-rc.5` 的页面标题显示为“AI专家办事大厅”。
2. 让 Conversation Hero 主标题显示为“AI专家办事大厅”。
3. 保留项目自有的侧栏品牌、Hero 图标和“预览版”徽章 CSS 隐藏实现。
4. 用实际打包 Desktop 验收窗口标题、页面标题、侧栏、Hero 图标/标题和徽章状态。

## 采用方案

- 官方源包、`build/workdsh-runtime` 原始副本和官方 node_modules 不修改。
- `build/workdsh-runtime` 只作为输入，复制目录结构到 `.runs/r74-<runId>/staging/workdsh-runtime` 唯一 staging 目录；普通 regular 文件优先使用同卷硬链接；若且仅若 `fs.link` 返回 `EPERM` 且源文件已有多个硬链接（只读 pnpm-store vendor 文件），才使用独立 `copyFile`，记录路径和计数；两个目标文件始终使用独立副本，禁止固定目录残留和并发复用。
- 源内 Junction/符号链接必须解析到 source root 内并映射到 staging root 内的等价绝对目标后再创建；源外、越界、未知 reparse 类型立即 fail closed，绝不保留 `build/workdsh-runtime` 源绝对目标。
- staging 中仅替换两个已登记的静态字符串：
  - `@deepseek-ai/dsh-client-ui-layout/lib/client.js` 的唯一 `productTitle`。
  - `@deepseek-ai/dsh-client-ui-conversation/lib/client.js` 的唯一中文 `hero.headline`。

当前输入哈希（固定 rc.5、已包含既有 two-seam frame patch）：

- layout：`686FB83C91C8FF8D03C365BB666EF34DACC3DD110EB768DEACBC7998B885C8C1`，32825 bytes；目标：`5B08B2924B7514DAE944EA48730F67AB3479489BD0DFD3B7DD82AB0DF8CF9383`，32829 bytes。
- conversation：`F7C22CFD56B2FFFB29FF9BC1B2D20B1B798FDF9D1C58FC39B3316BB01808DFC5`，783097 bytes；目标：`E0C7DCF2C8B65F8FC07E820BB4DD5FBDEFF4591D097C6620EF2B26614AE0B727`，783099 bytes。
- Electron Builder 通过本次 run 生成的配置覆盖 `extraResources.from`，从 staging 目录复制到打包资源中的 `workdsh-runtime`，运行时路径保持不变；缺失或路径越界立即 fail closed。
- 由于 Windows Junction 会被 Electron Builder 原样保留，打包前必须将 staging 的 source-root 内 Junction 展开为一个只含 regular files/directories 的 run-scoped materialized runtime；该层只读输入 staging，不修改 staging 或 source。
- 每次 staging 生成 `display-patch-receipt.json`，记录源/目标路径、版本、锚点、原始/补丁哈希、回滚哈希和输入 runId。
- 非目标文件的闭包证据使用路径/类型/size、源/目标 `dev+ino` 硬链接身份和映射后的 symlink target；目标文件单独记录完整 SHA-256。这样不读取 970 MB 两遍，但可证明 staging 读取的是源同一 inode，且补丁文件不共享 inode。

## 允许路径

- `apps/desktop/scripts/prepare-workdsh-display-staging.mjs`
- `apps/desktop/package.json` 的构建链
- `apps/desktop/scripts/electron-builder-config.mjs`、各打包入口的 staging 配置传递
- `apps/desktop/scripts/verify-display-staging-receipt.mjs`
- `apps/desktop/scripts/materialize-workdsh-display-runtime.mjs`
- `apps/desktop/scripts/verify-display-materialized-receipt.mjs`
- `apps/desktop/tests/**`、`scripts/package-desktop-release.mjs`
- `apps/desktop/scripts/verify-academy-brand-input.mjs`、相关测试
- `packages/bundle/**`、`packages/ui/**` 中已经登记的自有品牌实现
- `docs/**`、`DESIGN.md`、`PLAN.md`
- 每个 run 新建的 `.runs/r74-*/`

## 禁止路径

- 官方 DSH 源码树
- `apps/desktop/build/workdsh-runtime/**` 的直接写入
- 用户 Profile、凭据、Token、Cookie、会话正文
- Host、Agent Loop、模型调用、Composer、右侧面板和会话存储

## fail-closed 条件

- 版本不是 `0.2.1-rc.5`。
- 官方包路径、文件大小、原始 SHA-256 任一不匹配。
- 任一替换锚点出现 0 次或超过 1 次。
- staging 结果哈希与登记值不一致。
- 发现 staging 之外的官方运行时文件被写入。
- source/staging 结构 manifest 出现两个登记文件之外的差异，或非目标文件没有相同硬链接身份。
- 非目标文件出现未登记的复制 fallback，或 `EPERM` 以外的硬链接失败。
- Junction 映射目标越界、仍包含 source-root 绝对路径，或打包后 `realpath` 不落在 `resources/workdsh-runtime` 内。
- materialized runtime 出现任意 symlink/Junction、路径循环或 source/staging 越界。
- 插件安装/移除或重启后两个补丁文件失去目标哈希；该情况不得宣称品牌持久。

## 验收与回滚

- 静态：运行时版本/哈希/锚点、staging 依赖闭包、资源来源和包清单。
- UI：窗口标题、`document.title`、侧栏名称/图标、Hero 名称/图标、徽章节点存在但不可见且不可交互。
- 打包顺序：build → prepare 原始 runtime → primary runtime/command → 创建唯一 staging → 精确补丁/receipt → builder；所有打包入口均执行该顺序。
- 结构 manifest：`runtime.json`、`package.json`、`pnpm-lock`、package-cache、primary-runtime、office-skills 与非目标文件必须逐项相同；只允许两个登记的 `lib/client.js` 变化。成功硬链接的普通文件检查相同 inode；只读 vendor fallback 文件记录 source/staging size、独立 inode、`EPERM+nlink>1` 原因；链接检查等价的 staging 映射；两个目标文件检查完整 SHA。
- 打包后：检查 `@deepseek-ai/dsh`、layout、conversation 和 `.pnpm` 关键路径的 `realpath` 均在打包资源内，且不存在 source-root 绝对链接。
- materialization：输出树不含 reparse point；普通文件用同卷硬链接或登记的只读 vendor copy，两个显示目标仍独立；输出 manifest 与 staging 逻辑内容闭包一致。
- 持久性：个人模式安装/移除插件后重启，复核两个目标文件哈希和目标字符串；若运行时重物化丢失补丁，立即停止并登记为未完成。
- 本批次“页面标题”指 Host Conversation 页面；连接入口仍是独立路径，暂不纳入验收。
- 回滚：删除本 run 的 staging 目录和补丁回执，恢复临时 builder 配置；原始 `build/workdsh-runtime` 前后哈希必须相同。若已打包，只删除未发布的候选包并重新从原始 runtime 生成。

## 证据分类

- 官方声明：rc.5 包版本和许可证字段。
- 源码事实：当前 rc.5 的静态锚点、公开 Hero Slot 和 CSS class。
- 历史实验：r70/r73 的 UI、哈希和失败回执。
- 本批次实验：staging 补丁回执和打包 UI 验收。

本计划引用 [DESIGN.md](../DESIGN.md)、[PLAN.md](../PLAN.md) 和 [2026-11-15-ai-expert-branding-css-astra-audit-r73.md](2026-11-15-ai-expert-branding-css-astra-audit-r73.md)。
