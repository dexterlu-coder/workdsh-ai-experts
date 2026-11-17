# WorkDSH Desktop 启动诊断计划与回执

新增只读调查（2026-11-17）：r110 已完成[原始基线平台比较](docs/2026-11-17-original-baseline-platform-comparison.md)，基线 ZIP 关联 `e94c99d5f9e143fb67fec84a74978eb8218daf32`。仅写比较证据与文档，未改产品代码。跨平台修复原方案需据新发现修订范围和审计后实施，仍为 proposed。

本轮报告请求已汇总为 [构建全过程报告](docs/2026-11-17-build-process-report.md)（2026-11-17，r88—r109），包含流程、问题、处理、效率复盘和未完成验收；本次仅整理文档，不重启或修改已运行应用。

当前有效状态（2026-11-17）：`source-build-and-staging-ui-accepted / awaiting-user-review`。源码及自有包已构建，官方 Profile 重新安装通过，r109 完整检查通过，r108 的品牌主界面及 8 个新增专家已由子代理和主代理分别实际核对。Electron PID 3504、Host 子进程和 3080 端口在最终回执中存活。窗口保留供用户审核；实际证据见 [r108 报告](docs/2026-11-17-current-source-startup-r108.md)。r107 打包物化副线经过时间必要性复核后主动停止，进程退出且不完整输出保留；尚未完成的安装包验收单独登记在 [后续计划](docs/2026-11-17-packaged-validation-handoff.md)，等待用户决定是否启动，不称为已通过。

状态：`completed-with-current-source-launch`

本文件与 [DESIGN.md](DESIGN.md) 互相引用。该批次只做启动差异诊断、证据归档和当前原始版本启动验证。

## 批次

- `runId`：`r45-personal-cdp-20261115-001`
- 输入：历史 r2/r30/r40/r42/r57/r59/r60/r61/r69 证据、当前源码、同一 Electron 43.3.0。
- 允许路径：当前仓库的 `docs/`、`references/`、`.runs/`，以及为受控 ACL 对照创建的临时目录。
- 禁止路径：官方 DSH 源码、产品运行时二进制、用户凭据、Token、Cookie、用户正文和企业数据。

## 已完成的前置回执

1. `--no-sandbox` 与附加 `--disable-features=NetworkServiceSandbox` 的最小 Electron A/B 矩阵均复现 ACL 拒绝，证明 feature flag 不是根因。
2. 相同 Electron SHA-256、最小页面和 Node wrapper 在标准受保护 DACL 根目录下保持运行且没有 `mojo/network_sandbox` 拒绝；当前 `.runs` 两组仍失败。
3. 当前 `workdsh-ai-experts` 原始 WorkDSH 通过历史风格 Node wrapper、标准 DACL 根目录和测试环境例外成功打开，窗口标题为 `WorkDSH`，主界面可见。
4. 结论、原始输出和比较 JSON 已保存，未把未验证的 token 差异写成事实。

## 当前个人模式批次

- `r43-personal-clean-20261115-001`：全新 Home 仍停在启动页，Host 子进程长期存活但无端口；按分诊规则保存进程树并确认清理。
- `r44-personal-cold-capture-20261115-001`：Host stdout 明确输出 `[workdsh:probe] activated` 与 `dsh web:`；浏览器稳定报 `cannot create effect on inactive context`，随后 `workdsh-plugin-experts: failed`。
- `r45-personal-cdp-20261115-001`：CDP 完整栈定位到 `workdsh-plugin-experts` 的 `installExpertPresetMenu()` 异步 slot 回调，落在官方 `SlotRegistry.register()` 的 inactive Fiber 上。
- `r46-personal-overlay-skip-preset-20261115-001`：Profile overlay 装配失败，未生成 Host launcher，结果不用于根因判断。
- `r47-personal-skip-preset-20261115-001`：仅跳过预设包装后真实主界面可见，证明第一处故障假设。
- `r48-personal-source-fix-20261115-001`：源码修复构建产物已加载；Host ready 回执出现在 stderr，暴露 Desktop stdout-only parser 的第二处故障。

## 当前验证动作

在一次性运行副本中跳过 `installExpertPresetMenu()`，保持 Host、Profile、Electron、其他插件和用户数据契约不变。成功标准是个人模式真实主界面可见，且 experts、skills、library、connectors 入口均已激活；失败则保留完整 CDP/日志并新建 runId。

## 源码修复

- `packages/plugins/experts/src/client/PresetMenu.tsx`：slot 回调执行前调用 `ctx.fiber.assertActive()`；对注册竞态只吞掉 Cordis `INACTIVE_EFFECT`，其他异常继续抛出。
- `apps/desktop/src/workdsh-main.ts`：stdout 与 stderr 共用 ready URL 解析路径，保留两路独立脱敏诊断。
- `apps/desktop/src/workdsh-main.ts`：ready URL 不再因为入口切换仍为 `switching=true` 而被丢弃；这是当前 Profile 冷启动卡 loading 的第三处竞态修复。
- 构建：`corepack pnpm --filter workdsh-plugin-experts build` 成功；嵌套 Web 依赖和 esbuild 二进制由本机安装回执提供。
- 最终验收：[personal-boot-r49-20261115.md](docs/evidence/personal-boot-r49-20261115.md)。

## 当前源码最终启动批次

- `r50-current-source-personal-20261115-001`：从 `D:\project\codex\workdsh-ai-experts` 当前源码构建并启动，保留前两处修复并增加 ready 竞态修复；使用当前仓库 Electron 43.3.0、普通 Node wrapper、标准 DACL 运行根目录 `D:\project\codex\workdsh\r50-current-source-home6`，未使用候选仓库 Electron 或候选运行时。
- 当前源码自有包已装入本次运行副本：`workdsh-plugin-experts/dist/client.browser.js` SHA-256 `D70FD049B7810A661B703BD76FF4D35932FC34A97F382B24ABE27DA97C48012E`；`workdsh-ui/dist/index.js` SHA-256 `92A212AD0E050BB0F270A7E9BFA2892CFABF3255F9F21B56D717D2EF53E970D8`。
- UI 验收：Electron 窗口标题 `WorkDSH`；个人模式 loading 页面完成；主导航可见 `专家 · 技能 · 连接器`、`资料库`、`工作台` 和原生 Conversation；账户/API Key 提示为当前空环境预期状态。
- 完整回执：[.runs/r50-current-source-final-receipt.json](.runs/r50-current-source-final-receipt.json)。

## 八个预制专家整合批次

- `r63-seven-expert-runtime-retry-20261115-001`：在已有培训课程设计专家基础上，将其余 7 个 Skill 按同一发布时快照流程整合到当前源码；生成清单为 8 个专家，运行时和个人模式主界面均已验证。
- 源码提交：`3db89e76b38208cec64e77898428ce3785f63022`；发布清单记录 `sourceDirty=false`，官方 DSH 版本为 `0.2.1-rc.5`。
- 验收报告：[2026-11-15-eight-expert-integration.md](docs/2026-11-15-eight-expert-integration.md)；一次性运行回执：[.runs/r63-seven-expert-runtime-retry-20261115-001/final-receipt.json](.runs/r63-seven-expert-runtime-retry-20261115-001/final-receipt.json)。

## 首启预览说明抑制批次

- `r64-remove-preview-onboarding-20261115-001`：用户授权移除启动时官方“预览版说明”弹窗。Astra 只读审计确认仓库源码没有该文案；历史运行副本的 `workdsh-bundle/dist/client/harness/welcome-brand.js` 只改写官方 `settings.onboarding` 的 `welcome-notice`。本批次只在 WorkDSH bundle 的公开 Client 插槽中抑制该单一入口。
- 允许路径：`packages/bundle/src/client/harness/client.ts`、相关测试、`docs/`、`DESIGN.md`、`PLAN.md`；禁止修改官方 DSH 源码、官方运行时二进制、模型配置和用户数据。
- 成功标准：干净个人 Profile 首次启动不显示该说明卡片；主界面、Conversation、模型设置、专家/技能/连接器入口和 Host ready 仍可用；已初始化 Profile 重启不回归。失败按错误分诊规则换新 runId。
- 回滚：移除 WorkDSH 自有的 slot suppression 代码并恢复本批次前的 bundle 构建产物；官方包、用户配置和现有专家快照不变。
- 实施结果：提交 `236bf76f4f106db1c373f6562d8de87d7264f783` 已通过 Bundle 类型检查和构建；r70 干净个人 Home 进入主界面，未显示该弹窗，Host 在 `127.0.0.1:3080` 监听，专家入口显示 11 个（8 个预制专家 + 3 个原始专家）。详见 [2026-11-15-remove-preview-onboarding.md](docs/2026-11-15-remove-preview-onboarding.md) 和 [.runs/r70-remove-preview-onboarding-fresh-home-20261115-001/final-receipt.json](.runs/r70-remove-preview-onboarding-fresh-home-20261115-001/final-receipt.json)。

## 当前品牌替换批次

- `r71-ai-expert-branding-20261115-001`：目标文字已锁定为“AI专家办事大厅”；学院图标提案资源已复制并逐文件校验；尚未修改产品源码或生成图标。
- 计划：[2026-11-15-ai-expert-branding-plan.md](docs/2026-11-15-ai-expert-branding-plan.md)。
- 输入快照：[.runs/r71-ai-expert-branding-20261115-001/input-snapshot.json](.runs/r71-ai-expert-branding-20261115-001/input-snapshot.json)。
- 当前状态：`blocked / astra-rejected`。审计回执：[2026-11-15-ai-expert-branding-astra-audit.md](docs/2026-11-15-ai-expert-branding-astra-audit.md)。必须修订计划并使用新的 `runId`、`reviewId` 和输入快照后重新审计，当前不得进入 Terra 首写。
- 历史结果调查：[2026-11-15-historical-branding-investigation.md](docs/2026-11-15-historical-branding-investigation.md)。该调查按区域分别确认：原生窗口标题和侧栏有通过证据，动态网页标题与 Conversation Hero 仍失败。
- r72 CSS 隐藏徽章计划：[2026-11-15-ai-expert-branding-css-plan.md](docs/2026-11-15-ai-expert-branding-css-plan.md)；Astra 回执：[2026-11-15-ai-expert-branding-css-astra-audit.md](docs/2026-11-15-ai-expert-branding-css-astra-audit.md)。当前 `rejected / blocked`，不能进入 Terra。
- r73 修订计划：[2026-11-15-ai-expert-branding-css-plan-r73.md](docs/2026-11-15-ai-expert-branding-css-plan-r73.md)；Astra 回执：[2026-11-15-ai-expert-branding-css-astra-audit-r73.md](docs/2026-11-15-ai-expert-branding-css-astra-audit-r73.md)。Astra 为 `approved-with-changes`，但 Terra 官方运行时写入被自动审查拒绝，当前 `blocked`；分诊：[.runs/r73-ai-expert-branding-css-badge-20261115-001/failure-triage.md](.runs/r73-ai-expert-branding-css-badge-20261115-001/failure-triage.md)。

### r74 固定 rc.5 staging 显示补丁

- 用户已授权：采用最小范围的受控 staging 补丁；不修改官方源包或共享 `build/workdsh-runtime`。
- 计划：[2026-11-15-ai-expert-branding-staging-plan-r74.md](docs/2026-11-15-ai-expert-branding-staging-plan-r74.md)。
- 当前状态：`blocked / ui-mojo-acl`；receipt 与 materialized runtime 验收已通过，轻量 Electron UI 启动在仓库 `.runs` 和独立 Temp user-data 两次均被 Windows `mojo/platform_channel` ACL 拒绝。完整打包后置，不把 packaged Node EPERM 或 UI ACL 失败写成品牌逻辑失败。
- 范围：固定 rc.5 的 `productTitle` 与 `hero.headline` 两个静态显示字段；自有 Bundle/UI 继续负责品牌图标和徽章 CSS。
- staging：`.runs/r74-<runId>/staging/workdsh-runtime` 唯一路径；打包入口通过临时 electron-builder config 使用该路径，`to` 仍为 `workdsh-runtime`。
- 门禁：结构 manifest 只允许两个登记的 `lib/client.js` 差异；非目标文件优先保持相同 dev+ino，只有登记的 `EPERM+nlink>1` vendor fallback 可为独立 inode；源内 Junction 必须映射到 staging 内目标，目标文件必须独立 inode 且通过完整 SHA；打包后 realpath 必须落在资源目录内；验收连接页仍独立；安装/移除插件与重启后的补丁持久性必须实际检查。
- 包门禁：materialized runtime 必须无 symlink/Junction；Electron Builder 只从 materialized runtime 读取，打包后 reparse/realpath 检查仍保留。

### r74 轻量 UI 验收回执

- run：[`.runs/r74-ui-verification-20261115-001/pre-snapshot.json`](.runs/r74-ui-verification-20261115-001/pre-snapshot.json)。
- 已通过：staging receipt、materialized receipt、261381 文件 regular-tree manifest、目标 occurrence SHA/bytes、无 reparse 结构。
- 未通过：Electron 初始化阶段 `mojo/platform_channel.cc:108` 返回 Windows `拒绝访问 (0x5)`；独立 Temp user-data/`DSH_HOME` 未改变现象；未获得 WorkDSH 窗口，不能宣称 UI 验收完成。
- 原始分诊：[failure-triage-ui-mojo-acl.json](.runs/r74-ui-verification-20261115-001/failure-triage-ui-mojo-acl.json)。后续若处理启动，必须新建启动诊断 run，复用历史标准受保护 DACL 基线。
- 性能分诊：完整 970 MB/41822 文件逐项 SHA 在 Windows 上连续三次超过 5–10 分钟未完成，已停止；不得在旧 run 原地重试。新审计计划采用同卷硬链接闭包和目标文件 SHA。

### r74 打包经验与当前轻量验收

- 经验归档：[2026-11-15-r74-packaging-lessons.md](docs/2026-11-15-r74-packaging-lessons.md)。该文档汇总 r74-001 至 r74-009、materialized v9/v10、Junction 闭包、只读 pnpm vendor、receipt digest、tray 色值、组合哈希和 packaged Node EPERM。
- 当前用户目标：先验证显示修改，不进入正式发布打包。验收顺序为 receipt/目标哈希 → materialized 无 reparse → Electron 启动 → UI 检查；正式打包/安装包另建发布批次。
- 当前输入：materialized receipt：[`.runs/r74-package-materialization-v10-20261115-001/materialized-receipt.json`](.runs/r74-package-materialization-v10-20261115-001/materialized-receipt.json)；打包尝试未被宣称通过，v10 packaged Node EPERM 分诊已归档。

## r81 当前源码品牌 UI 验证计划（2026-11-16）

- 状态：`completed / current-source-ui-accepted`；当前源码构建和实际窗口验收已完成。
- 目标：从当前源码重新生成并验证黄色框原生窗口标题/图标、蓝色框侧栏标题/图标、红色框 Conversation Hero 标题/图标；使用 CSS 隐藏红色框“预览版”徽章。
- 固定文字：三个区域统一显示 **“AI专家办事大厅”**。图标使用已复制并登记的项目资源。
- 第一阶段：静态定位每个区域的源码 owner、字段、资源、构建入口和运行时产物；对比源码、dist、Profile 和运行时哈希，解释 r80 显示旧品牌的传播断点。
- 第二阶段：只修改项目自有品牌字段、图标资源和徽章 CSS；通过项目标准构建生成必要产物。禁止修改官方 DSH 源码、官方运行时字节、Conversation 布局/交互、Composer、右侧面板、Host、Agent、模型调用和会话存储。
- 第三阶段：已新建干净 UI run，复用已校验 Electron 和稳定运行时，只隔离 user-data、DSH_HOME、DSH_AGENTS_HOME、临时目录、日志、端口和进程；没有复制整个运行时，也没有把正式安装包作为前置条件。
- 验收矩阵：Electron 窗口标题和图标正确；侧栏标题和图标正确；Hero 标题和图标正确；预览徽章不可见；布局尺寸和位置未变化；主界面、Host、Conversation、专家/技能/连接器入口仍可用。每项保存截图/AX 观察、版本、哈希、退出码和进程状态。
- 失败处理：发现旧产物、版本/哈希/路径偏差、进程残留或新的根因时停止当前 run，保留失败输出并新建 run；不得在同一 run 上盲目重试。
- 进入条件：先完成本计划的静态定位和输入快照；代码首写前按标准实施流程取得 Astra/high 只读审核结论，再按结论进入后续实施。
- 回滚：恢复本批次自有源码、资源和生成产物到 pre-snapshot；官方运行时、用户数据、历史 r74 证据和已有专家资产保持不变。
- 实施回执：[2026-11-16-ai-expert-branding-r82-ui-acceptance.md](docs/2026-11-16-ai-expert-branding-r82-ui-acceptance.md)。窗口实际观察到三处品牌、预览徽章和左上方“新会话”位置均符合目标。

## r83 Desktop 入口页面品牌计划（2026-11-16）

- 状态：`completed / current-source-ui-accepted`。
- 目标：修改选择使用方式页面和正在启动个人工作区页面内部的页面标题、品牌文字和学院建筑图标；固定文字为“AI专家办事大厅”。
- 计划与 allowlist：[2026-11-16-connection-entry-branding-plan.md](docs/2026-11-16-connection-entry-branding-plan.md)。
- 源码 owner：`apps/desktop/src/connection-entry.ts`；调用路径为 `workdsh-main.ts` 的 entry/personal loading 分支；现有测试为 `apps/desktop/tests/connection-entry.spec.ts`。
- 禁止范围：官方 DSH runtime、Electron、Host/Agent/模型/会话逻辑、入口协议、表单/CSP/转义/布局和用户数据。
- 进入条件：完成 Astra/high 只读审核并生成新的 `runId`、输入哈希和 pre-snapshot；在审核完成前不写源码。
- Astra/high 审计：`approved-with-changes`；回执：[2026-11-16-connection-entry-branding-astra-audit.md](docs/2026-11-16-connection-entry-branding-astra-audit.md)。共享 header 同步企业登录/企业启动页的静态品牌已登记为有意范围，`apps/desktop/lib/`、派生图标和临时 UI run 只作证据，不纳入源码 allowlist。
- 验收：静态测试、类型检查和两个入口状态的实际窗口截图；回滚只恢复本批次自有 HTML/测试和文档。
- 实施回执：[2026-11-16-connection-entry-branding-r84-ui-acceptance.md](docs/2026-11-16-connection-entry-branding-r84-ui-acceptance.md)。r84 选择页、个人启动页和随后主界面均通过实际窗口验收；r83 首次失败已按分诊规则换 runId 并保留负证据。

## 证据

- r113 审核 / r114 main 合并批次：[冻结工作包](docs/2026-11-17-main-merge-plan.md)。Astra/high 为 approved-with-changes；文档登记导致旧快照变化已按意见换 r114 重新冻结。用户授权合并当前分支；仅补必要测试适配并提交稳定源码/文档，通过 PR 和适用必需门禁合并；不发产品、不改 CI、不重构平台策略、不碰当前窗口。状态及范围以该工作包为准。
- r112 当前平台调查：[契约对照](docs/2026-11-17-current-platform-contract-comparison.md)、[Windows 地图](docs/2026-11-17-current-windows-packaging-map.md)。范围：原版/当前 75 路径哈希和必要 diff、有限只读路径观察及文档；allowlist 仅两份新报告、兼容提案、总目录、DESIGN/PLAN 和 `.runs/r112-current-platform-contract-audit-20261117-001/`；禁止产品/运行时修改、构建/GUI/依赖安装、提交推送发布。验收：来源与输入哈希、P01—P20 对照、路径观察、链接及产品输入未变；回滚只撤销本轮文档增量，保留之前 dirty 状态。状态：`research-complete / adaptation-design-not-frozen`。
- 原版三平台契约基线：[2026-11-17-original-three-platform-baseline.md](docs/2026-11-17-original-three-platform-baseline.md)；r111 为只读源码调查与文档交付，57 个节选文件与 e94c99d5 匹配，不运行构建或改动当前应用。allowlist 为该报告、`references/original-platform-baseline-e94c99d5/`、总目录、DESIGN/PLAN 及 r111 回执；禁止产品/官方源码、运行时、锁文件、构建配置、GUI/进程、Git 推送或发布变更。验收为来源/源文件哈希、引用链接及边界核对；回滚只移除本轮新增材料和入口，保留 pre-documentation 中既有 dirty 内容。状态：`research-complete / no-product-change`。
- 启动经验固化与门禁：[docs/2026-11-15-startup-history-gate.md](docs/2026-11-15-startup-history-gate.md)
- [COMPARISON-RESULT.json](.runs/electron-matrix-r61-20261114/r42-standard-acl/COMPARISON-RESULT.json)
- [MATRIX-RESULT.json](.runs/electron-matrix-r61-20261114/MATRIX-RESULT.json)
- [原始复现记录](docs/evidence/electron-network-sandbox-r61-repro-20261114.txt)
- [历史启动证据索引](references/startup-evidence-20261114/README.md)

## 回滚

本批次没有产品源码或运行时改动。若清理实验材料，只删除 `.runs` 下本批次副本；长期分析与证据索引保留。

本次新增的源码改动属于当前源码启动所需修复，不回滚。运行时副本改动只位于 `.runs/r50-current-runtime`；恢复旧运行时可使用 `.runs/r50-current-source-ui/before-workdsh-ui` 和 `.runs/r50-current-source/before-installed` 备份。


## r86 受控复用 UI + 八专家验收（2026-11-16）

- 状态：`completed / controlled-reuse-ui-accepted`。
- 目标：在同一隔离个人运行中同时验收当前源码的品牌 UI 产物和 r63 已验收的八个预置专家。
- 方案：复用已能启动的 Electron、官方 DSH `0.2.1-rc.5` runtime、Profile、Host 和当前自有 Bundle/UI；仅替换运行时对应的 WorkDSH 自有 `workdsh-plugin-experts` 包；不进行官方运行时全量重建。
- 运行目录：`D:\project\codex\workdsh\r86-controlled-reuse-ui-experts-20261116-001`，隔离 `DSH_HOME`、`DSH_AGENTS_HOME`、Desktop user-data、临时目录、AppData、日志和进程。
- 验收：窗口标题和侧栏品牌为“AI专家办事大厅”；Host ready；专家入口显示 8 个预置专家加 3 个原始专家；端口 3080 可用；launcher 和 Electron 仍存活。
- 证据：[2026-11-16-controlled-reuse-ui-expert-acceptance.md](docs/2026-11-16-controlled-reuse-ui-expert-acceptance.md)。
- 限定：本批次证明受控复用组合可用，不证明从干净源码全量构建的可复现性；正式发布另建 runId。

## r88-r96 完整构建分支验收（2026-11-17）

- 状态：`blocked / packaged-runtime-not-accepted`。
- 分支：`codex/full-build-validation-20261116`；基线提交 `a945acb5e9`；当前验证提交 `53edba76ce`。
- 已通过：immutable install、完整 `corepack yarn check`、Desktop/Web DSH 对齐、Desktop 构建、类型检查、166 个测试、Web release candidate 和 13 个 Desktop feature 包归档；专家归档仍为 8 个预置专家。
- 未通过：标准 local release 在官方 Profile 安装阶段缺少 `@deepseek-ai/cordis@4.0.5` tarball。配置镜像网络不可用；切换官方 registry 因本机 npm 认证凭据被自动审查拒绝；离线缓存也无法补齐该 tarball。
- 因此未宣称 packaged Desktop、Host、个人入口、主界面或专家入口验收；当前共享 runtime 在失败的 Profile 准备过程中不再完整，不能继续启动实验。
- 详细报告：[2026-11-17-full-build-validation.md](docs/2026-11-17-full-build-validation.md)。
- 回滚：验证分支可回到 `a945acb5e9`；`main` 未被修改、未推送验证分支、未创建发布标签。

### r99-r100 续跑（2026-11-17）

- 最新状态：`staging-ui-passed / packaged-pending`。r108 实际进入个人主界面并显示 8 名预置专家与 3 名原始专家；窗口保留供审核。r109 完整检查退出码 0。详见 [r108 报告](docs/2026-11-17-current-source-startup-r108.md)；物化及 packaged runtime 验收仍在进行，不得据此声明发布完成。

- 验证提交 `aee688b755bb03747ebc6e5227768285bfa80d0e`。staging 启动采用已批准的完整构建范围和回滚，复用当前提交的本地 release 归档；未发布产品。后续物化修复按其独立登记范围执行。
- 网络诊断及原始证据见 [r99-r100 报告](docs/2026-11-17-profile-network-diagnosis.md)。Profile 安装使用无凭据配置与本机 HTTP 代理，退出码 0。
- Profile 成功后顺序准备 primary runtime、command、display staging、materialized runtime，验证回执后构建 unsigned 目录包。每个新 run 先记录输入、允许与禁止路径和回滚状态；失败先分诊。启动遵循 [历史门禁](docs/2026-11-15-startup-history-gate.md)，实际验收个人入口、Host、主界面与专家入口，并保留窗口供用户审核。成功构建不等于发布或 UI 验收。

## 规则维护批次：资源隔离与最小证据（2026-11-16）

- 输入：Astra/high 只读审核、现有全局与项目 AGENTS.md、当前 DESIGN.md、PLAN.md 和历史打包经验。
- 实施：在上级全局规则新增通用子节；在本项目规则新增 DSH 适配节；新增稳定报告并登记到 docs/RESEARCH_INDEX.md。
- 验收：全局规则只包含跨项目原则；项目规则只包含 DSH 状态、路径和验收适配；历史命令、日志、哈希和负证据仍留在 docs/ 与 .runs/；现有源码改动未被覆盖。
- 回滚：删除本批次新增的全局子节、项目适配节、报告和索引行；不回滚本批次之前的源码、计划或历史证据。
# r106 硬链接上限修复

Astra/high 审计 approved-with-changes。目标：Windows 1024 硬链接上限时安全复制并验证，保留原 EPERM 规则。输入哈希及 dirty 状态见同级 runs/r106-hardlink-limit-20261117-001；参考为现有物化器和验收器源码事实。允许：两个物化脚本、一个规则测试、DESIGN/PLAN及索引。禁止：官方文件、staging、其他产品代码和 r105 运行状态。验收：规则正反例、r107 物化与回执校验。回滚：恢复 r106 pre-snapshot 中两个脚本、删除本批新增测试及文档记录；保留运行证据。

- r106 实施、r107 主动中止与 r109 检查结果见 [硬链接上限报告](docs/2026-11-17-materialize-hardlink-limit-r106.md)；materialized pointer 未生成，打包运行时未验收。
