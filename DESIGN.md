# WorkDSH Desktop 启动诊断设计

状态：`completed-with-current-source-launch`

本文件与 [PLAN.md](PLAN.md) 互相引用。当前记录的目标是解释历史临时环境为何能够启动、当前源码为何被 Windows 拒绝访问，并保留可复核的启动路径。

## 结论与边界

- 历史临时环境改变了用户数据目录、环境继承、Electron/Chromium 沙箱参数、监督方式和运行时配对，不是单纯换了一个文件夹。
- 受控对照显示：相同 Electron、相同最小页面和相同 Node wrapper，在标准受保护 DACL 根目录下可以存活；当前 `.runs` 根目录下出现 `mojo/network_sandbox` ACL 拒绝。DACL/继承差异是当前最强已验证原因，launcher token 差异仍未证明。
- `--disable-features=NetworkServiceSandbox` 已被 A/B 实验排除为根因；`--no-sandbox` 只能作为测试例外，不是产品默认修复。
- 本次诊断不修改官方 DSH 源码、Electron 二进制或产品 UI；实验脚本和回执保存在 `.runs`，长期结论保存在 `docs/` 与 `references/`。
- 当前个人模式的新证据确认两处独立启动故障：`workdsh-plugin-experts` 的 `installExpertPresetMenu()` 异步 slot 回调会在 Cordis Fiber 失效后调用 `slots.register()`；Desktop `startRuntime()` 只从 stdout 解析 Host ready，而 Host ready 也可能出现在 stderr。两处都已形成最小实验与源码修复。
- 当前源码个人模式最终启动又确认第三处竞态：`startRuntime()` 在入口切换仍为 `switching=true` 时会丢弃一次性 Host ready URL；当前 Profile 冷启动足够快时会稳定复现 loading 卡住。修复后通过普通 Node wrapper、当前仓库 Electron 和当前源码构建的 WorkDSH UI/Experts 包进入主界面。

## 当前首启提示批次

用户于 2026-11-15 明确授权移除启动时的官方“预览版说明”首启提示。只允许通过公开的 `settings.onboarding` 插槽按稳定 ID `welcome-notice` 注册一个空组件，抑制该单一说明卡片；不修改官方 DSH 包字节，不改模型配置、Conversation、Composer、右侧面板、专家入口或首启配置状态。该批次的事实、验收和回滚见 [PLAN.md](PLAN.md) 与 [docs/2026-11-15-remove-preview-onboarding.md](docs/2026-11-15-remove-preview-onboarding.md)。

## 参考入口

- 详细分析：[docs/2026-11-14-electron-temporary-environment-first-principles.md](docs/2026-11-14-electron-temporary-environment-first-principles.md)
- 启动经验门禁：[docs/2026-11-15-startup-history-gate.md](docs/2026-11-15-startup-history-gate.md)
- 运行证据索引：[references/startup-evidence-20261114/README.md](references/startup-evidence-20261114/README.md)
- 原始复现记录：[docs/evidence/electron-network-sandbox-r61-repro-20261114.txt](docs/evidence/electron-network-sandbox-r61-repro-20261114.txt)
- 实施与验收：[PLAN.md](PLAN.md)
- 当前源码最终启动回执：[.runs/r50-current-source-final-receipt.json](.runs/r50-current-source-final-receipt.json)

## 当前品牌替换批次

用户已将目标文字更正并确认：三个客户可见区域统一使用 **“AI专家办事大厅”**。学院图标提案已复制到当前仓库，但尚未进入产品构建目录。新批次计划、allowlist、禁止路径、资源哈希和验收边界见 [2026-11-15-ai-expert-branding-plan.md](docs/2026-11-15-ai-expert-branding-plan.md)；当前状态为 `blocked / astra-rejected`，不得进入 Terra 首写。
历史结果调查见 [2026-11-15-historical-branding-investigation.md](docs/2026-11-15-historical-branding-investigation.md)：按区域分别核对后，原生窗口标题和侧栏有通过证据，动态网页标题和 Conversation Hero 仍未通过。
最新 CSS 隐藏徽章批次见 [2026-11-15-ai-expert-branding-css-plan.md](docs/2026-11-15-ai-expert-branding-css-plan.md)，r72 已被 Astra 判定为 `rejected / blocked`；必须补齐 rc.5 DOM/selector、Hero 接口和布局保持证据后重新审计。
r73 Astra 为 `approved-with-changes`，但 Terra 对官方运行时文件的写入被自动审查拒绝；当前 Run 已 blocked，保留自有源码改动，官方运行时未修改。分诊见 `.runs/r73-ai-expert-branding-css-badge-20261115-001/failure-triage.md`。

r74 已获用户授权采用最小范围的受控 staging 显示补丁。官方 rc.5 源包和共享 `build/workdsh-runtime` 保持不可变；只复制到每次新建的 staging 目录，精确替换页面标题和 Hero 主标题，并由项目自有代码提供品牌图标和徽章 CSS。计划、allowlist、禁止路径和验收见 [2026-11-15-ai-expert-branding-staging-plan-r74.md](docs/2026-11-15-ai-expert-branding-staging-plan-r74.md)。

r74 打包经验已归档到 [2026-11-15-r74-packaging-lessons.md](docs/2026-11-15-r74-packaging-lessons.md)。当前显示验证采用 materialized runtime + Electron UI 的轻量链；完整 package/installer 只作为后续发布门禁。receipt、materialized manifest 和目标哈希已通过；Electron UI 仍被 Windows `mojo/platform_channel` ACL 拒绝阻断，详见 [.runs/r74-ui-verification-20261115-001/failure-triage-ui-mojo-acl.json](.runs/r74-ui-verification-20261115-001/failure-triage-ui-mojo-acl.json)。

### r81 当前源码品牌 UI 验证批次

状态：`completed / current-source-ui-accepted`。本批次只解决三个客户可见品牌区域和预览徽章，不改变布局、交互、Conversation、Composer、右侧面板、Host、Agent、模型调用或会话存储。

- 黄色框：验证并替换 Electron 原生窗口标题和图标为 **“AI专家办事大厅”** 及已登记图标资源。
- 蓝色框：验证并替换左侧栏品牌标题和图标为 **“AI专家办事大厅”** 及已登记图标资源。
- 红色框：验证并替换 Conversation Hero 标题和图标为 **“AI专家办事大厅”** 及已登记图标资源。
- 红色框中的“预览版”徽章只通过 CSS 隐藏，不删除官方组件，不改变 Hero 布局尺寸和位置。

先静态定位三个区域的源码 owner、构建入口和实际运行时产物，核对源码、dist、Profile 与运行时文件的版本和哈希，解释 r80 为什么仍显示旧品牌。定位结果已写入 [2026-11-16-ai-expert-branding-r82-ui-acceptance.md](docs/2026-11-16-ai-expert-branding-r82-ui-acceptance.md)，并完成自有源码构建和干净 UI run。正式打包不是本批次的前置条件。

本批次允许范围仅包括项目自有的品牌字段、图标资源、徽章 CSS、构建产物和 `docs/`/`.runs/` 证据；禁止修改官方 DSH 源码、官方运行时字节、Conversation 布局与交互、模型配置、用户数据和企业数据。回滚只恢复本批次自有源码和生成产物，保留 r74 及更早历史证据。

实际验收：窗口原生标题/图标、左侧栏品牌、Hero 品牌和徽章状态均符合目标；左上方“新会话”按钮位置保持不变。证据、版本、哈希和运行根目录见 [2026-11-16-ai-expert-branding-r82-ui-acceptance.md](docs/2026-11-16-ai-expert-branding-r82-ui-acceptance.md)。


## 资源隔离与最小证据规则

2026-11-16 Astra/high 只读审核确认：跨项目原则写入上级 D:\project\codex\AGENTS.md，DSH 运行时和验收落点写入本项目 AGENTS.md。独立运行目录只隔离会互相影响的可变状态；来源、版本、哈希、权限、架构、路径和链接语义已确认稳定且只读的输入优先复用。审核依据、边界和历史案例见 docs/2026-11-16-resource-isolation-and-minimum-evidence.md。
